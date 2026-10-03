import { ReviewSubmission } from '../models/ReviewSubmission';
import { WordEntry } from '../models/WordEntry';
import { getCurrentAuthUserId, supabase } from './auth';
import {
  clearCloudCollectionMarker,
  cloudStorageKeys,
  loadClearedCollections,
  loadDeletedWordTombstones,
  loadReviewSubmissions,
  loadWordEntries,
  persistReviewSubmissions,
  persistWordEntries,
  removeDeletedWordTombstones,
} from './wordStorage';

export type CloudSyncStatus = 'disabled' | 'idle' | 'syncing' | 'synced' | 'error';

export type CloudSyncSnapshot = {
  status: CloudSyncStatus;
  error: string | null;
};

export type CloudSyncResult = {
  status: 'disabled' | 'synced';
  words: number;
  reviews: number;
};

type CloudWordRow = {
  user_id: string;
  id: string;
  word: string;
  normalized_word: string;
  first_letter: string;
  phonetic: string | null;
  audio_url: string | null;
  part_of_speech: string | null;
  meaning_short: string;
  definitions: unknown;
  example: string | null;
  examples: unknown;
  synonyms: unknown;
  antonyms: unknown;
  my_meaning: string | null;
  personal_note: string | null;
  is_favorite: boolean;
  search_count: number;
  reviewed_count: number;
  correct_count: number;
  mastery_level: number;
  source: string;
  created_at: string;
  updated_at: string;
  last_searched_at: string;
};

type CloudReviewRow = ReviewSubmission & { user_id: string };

let snapshot: CloudSyncSnapshot = {
  error: null,
  status: supabase ? 'idle' : 'disabled',
};
let syncPromise: Promise<CloudSyncResult> | null = null;
const listeners = new Set<(next: CloudSyncSnapshot) => void>();

export function getCloudSyncSnapshot() {
  return snapshot;
}

export function subscribeCloudSync(listener: (next: CloudSyncSnapshot) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function setSnapshot(next: CloudSyncSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener(snapshot);
}

function listValue<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function safeTimestamp(value: unknown, fallback: string) {
  const candidate = typeof value === 'string' ? value : '';
  return candidate && !Number.isNaN(new Date(candidate).getTime()) ? candidate : fallback;
}

function toWordEntry(row: CloudWordRow): WordEntry {
  const now = new Date().toISOString();
  return {
    antonyms: listValue<string>(row.antonyms),
    audio_url: row.audio_url || null,
    correct_count: Number.isFinite(row.correct_count) ? row.correct_count : 0,
    created_at: safeTimestamp(row.created_at, now),
    definitions: listValue<WordEntry['definitions'][number]>(row.definitions),
    example: row.example || null,
    examples: listValue<string>(row.examples),
    first_letter: row.first_letter || row.normalized_word.charAt(0).toUpperCase(),
    id: row.id,
    is_favorite: row.is_favorite === true,
    last_searched_at: safeTimestamp(row.last_searched_at, now),
    mastery_level: Math.max(0, Math.min(5, Number(row.mastery_level) || 0)),
    meaning_short: row.meaning_short || '',
    my_meaning: row.my_meaning || null,
    normalized_word: row.normalized_word,
    part_of_speech: row.part_of_speech || null,
    personal_note: row.personal_note || null,
    phonetic: row.phonetic || null,
    reviewed_count: Number.isFinite(row.reviewed_count) ? row.reviewed_count : 0,
    search_count: Number.isFinite(row.search_count) ? row.search_count : 0,
    source: row.source || 'cloud',
    synonyms: listValue<string>(row.synonyms),
    updated_at: safeTimestamp(row.updated_at, now),
    word: row.word || row.normalized_word,
  };
}

function toCloudWord(userId: string, entry: WordEntry): CloudWordRow {
  return { ...entry, user_id: userId };
}

function toCloudReview(userId: string, submission: ReviewSubmission): CloudReviewRow {
  return { ...submission, user_id: userId };
}

function newer(local: WordEntry, cloud: WordEntry) {
  const localTime = Date.parse(local.updated_at);
  const cloudTime = Date.parse(cloud.updated_at);
  return Number.isNaN(cloudTime) || (!Number.isNaN(localTime) && localTime >= cloudTime) ? local : cloud;
}

function mergeWords(local: WordEntry[], cloud: WordEntry[]) {
  const cloudByWord = new Map(cloud.map((entry) => [entry.normalized_word, entry]));
  const localByWord = new Map(local.map((entry) => [entry.normalized_word, entry]));
  const normalizedWords = new Set([...cloudByWord.keys(), ...localByWord.keys()]);
  return Array.from(normalizedWords)
    .map((normalizedWord) => {
      const localEntry = localByWord.get(normalizedWord);
      const cloudEntry = cloudByWord.get(normalizedWord);
      if (!localEntry) return cloudEntry!;
      if (!cloudEntry) return localEntry;
      return { ...newer(localEntry, cloudEntry), id: cloudEntry.id };
    })
    .filter((entry): entry is WordEntry => !!entry);
}

function mergeReviews(local: ReviewSubmission[], cloud: ReviewSubmission[]) {
  const merged = new Map(cloud.map((submission) => [submission.id, submission]));
  for (const submission of local) merged.set(submission.id, submission);
  return Array.from(merged.values()).sort((a, b) => b.completed_at.localeCompare(a.completed_at));
}

async function deleteCloudWords(userId: string, normalizedWord?: string) {
  let request = supabase!.from('word_entries').delete().eq('user_id', userId);
  if (normalizedWord) request = request.eq('normalized_word', normalizedWord);
  const { error } = await request;
  if (error) throw error;
}

async function deleteCloudReviews(userId: string) {
  const { error } = await supabase!.from('review_submissions').delete().eq('user_id', userId);
  if (error) throw error;
}

async function performSync(): Promise<CloudSyncResult> {
  if (!supabase) {
    setSnapshot({ error: null, status: 'disabled' });
    return { reviews: 0, status: 'disabled', words: 0 };
  }

  const userId = await getCurrentAuthUserId();
  if (!userId) {
    setSnapshot({ error: null, status: 'idle' });
    return { reviews: 0, status: 'disabled', words: 0 };
  }

  setSnapshot({ error: null, status: 'syncing' });
  const [localWords, localReviews, tombstones, clearedWords, clearedReviews] = await Promise.all([
    loadWordEntries(),
    loadReviewSubmissions(),
    loadDeletedWordTombstones(),
    loadClearedCollections(cloudStorageKeys.clearedWords),
    loadClearedCollections(cloudStorageKeys.clearedReviews),
  ]);

  if (clearedWords[userId]) await deleteCloudWords(userId);
  if (clearedReviews[userId]) await deleteCloudReviews(userId);

  const userTombstones = tombstones.filter((entry) => entry.user_id === userId);
  for (const tombstone of userTombstones) await deleteCloudWords(userId, tombstone.normalized_word);

  const [{ data: cloudWordRows, error: wordsError }, { data: cloudReviewRows, error: reviewsError }] = await Promise.all([
    supabase.from('word_entries').select('*').eq('user_id', userId),
    supabase.from('review_submissions').select('*').eq('user_id', userId),
  ]);
  if (wordsError) throw wordsError;
  if (reviewsError) throw reviewsError;

  const deletedWords = new Set(userTombstones.map((entry) => entry.normalized_word));
  const cloudWords = listValue<CloudWordRow>(cloudWordRows)
    .filter((row) => !deletedWords.has(row.normalized_word))
    .map(toWordEntry);
  const cloudReviews = listValue<CloudReviewRow>(cloudReviewRows);
  const mergedWords = mergeWords(localWords, cloudWords);
  const mergedReviews = mergeReviews(localReviews, cloudReviews);

  await persistWordEntries(mergedWords);
  await persistReviewSubmissions(mergedReviews);

  if (mergedWords.length) {
    const { error } = await supabase.from('word_entries').upsert(mergedWords.map((entry) => toCloudWord(userId, entry)), {
      onConflict: 'user_id,normalized_word',
    });
    if (error) throw error;
  }
  if (mergedReviews.length) {
    const { error } = await supabase.from('review_submissions').upsert(mergedReviews.map((submission) => toCloudReview(userId, submission)), {
      onConflict: 'user_id,id',
    });
    if (error) throw error;
  }

  if (clearedWords[userId]) await clearCloudCollectionMarker(cloudStorageKeys.clearedWords, userId);
  if (clearedReviews[userId]) await clearCloudCollectionMarker(cloudStorageKeys.clearedReviews, userId);
  if (userTombstones.length) await removeDeletedWordTombstones(userId, userTombstones.map((entry) => entry.normalized_word));

  setSnapshot({ error: null, status: 'synced' });
  return { reviews: mergedReviews.length, status: 'synced', words: mergedWords.length };
}

export function syncAuthenticatedData() {
  if (syncPromise) return syncPromise;
  syncPromise = performSync()
    .catch((error) => {
      setSnapshot({ error: error instanceof Error ? error.message : 'Cloud sync failed.', status: 'error' });
      throw error;
    })
    .finally(() => {
      syncPromise = null;
    });
  return syncPromise;
}

export function queueCloudSync() {
  return syncAuthenticatedData();
}
