import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReviewSubmission } from '../models/ReviewSubmission';
import { WordEntry } from '../models/WordEntry';
import { getCurrentAuthUserId } from './auth';

const KEY = 'my-dictionary.words.v1';
const REVIEW_SUBMISSIONS_KEY = 'my-dictionary.review-submissions.v1';
const ONBOARDING_KEY = 'my-dictionary.onboarded.v1';
const DELETED_WORDS_KEY = 'my-dictionary.cloud-deleted-words.v1';
const CLEARED_WORDS_KEY = 'my-dictionary.cloud-cleared-words.v1';
const CLEARED_REVIEWS_KEY = 'my-dictionary.cloud-cleared-reviews.v1';
const LOCAL_OWNER_KEY = 'my-dictionary.local-owner.v1';
const RECOVERY_WORDS_KEY = 'my-dictionary.recovery.words.v1';
const RECOVERY_REVIEWS_KEY = 'my-dictionary.recovery.reviews.v1';
const ANONYMOUS_OWNER = 'anonymous';

export type StorageCollection = 'words' | 'reviews';
export type StorageIssueReason = 'invalid-json' | 'invalid-shape' | 'invalid-entry';
export type StorageIssue = {
  collection: StorageCollection;
  reason: StorageIssueReason;
  detected_at: string;
};
export type StorageHealth = {
  needsRecovery: boolean;
  issues: StorageIssue[];
};

const storageIssues = new Map<StorageCollection, StorageIssue>();

export type DeletedWordTombstone = {
  user_id: string;
  normalized_word: string;
  deleted_at: string;
};

type UserTimestampMap = Record<string, string>;

async function currentUserIdSafely() {
  try {
    return await getCurrentAuthUserId();
  } catch {
    return null;
  }
}

function userScopedKey(baseKey: string, userId: string) {
  return `${baseKey}.user.${encodeURIComponent(userId)}`;
}

function collectionForKey(baseKey: string): StorageCollection | null {
  if (baseKey === KEY) return 'words';
  if (baseKey === REVIEW_SUBMISSIONS_KEY) return 'reviews';
  return null;
}

function recoveryKey(baseKey: string, userId: string | null) {
  const base = baseKey === KEY ? RECOVERY_WORDS_KEY : RECOVERY_REVIEWS_KEY;
  return `${base}.user.${encodeURIComponent(userId || ANONYMOUS_OWNER)}`;
}

function isUsableStoredEntry(baseKey: string, value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  if (baseKey === KEY) {
    return typeof entry.id === 'string'
      && typeof entry.word === 'string'
      && typeof entry.normalized_word === 'string'
      && typeof entry.meaning_short === 'string'
      && Array.isArray(entry.definitions);
  }
  if (baseKey === REVIEW_SUBMISSIONS_KEY) {
    return typeof entry.id === 'string'
      && typeof entry.completed_at === 'string'
      && Array.isArray(entry.reviewed_words)
      && Array.isArray(entry.questions);
  }
  return true;
}

function parseArray<T>(raw: string | null, baseKey: string): { values: T[]; reason?: StorageIssueReason } {
  if (!raw) return { values: [] };
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return { values: [], reason: 'invalid-shape' };
    const values = value.filter((entry) => isUsableStoredEntry(baseKey, entry)) as T[];
    return values.length === value.length ? { values } : { values, reason: 'invalid-entry' };
  } catch {
    return { values: [], reason: 'invalid-json' };
  }
}

async function recordStorageIssue(baseKey: string, userId: string | null, reason: StorageIssueReason, raw: string | null) {
  const collection = collectionForKey(baseKey);
  if (!collection) return;
  const issue: StorageIssue = { collection, reason, detected_at: new Date().toISOString() };
  storageIssues.set(collection, issue);
  if (!raw) return;
  try {
    const key = recoveryKey(baseKey, userId);
    if (!await AsyncStorage.getItem(key)) {
      await AsyncStorage.setItem(key, JSON.stringify({ format: 'my-dictionary-recovery', version: 1, issue, raw }));
    }
  } catch {
    // Recovery is best effort; the original storage value is never deleted here.
  }
}

async function parseStoredArray<T>(baseKey: string, userId: string | null, raw: string | null) {
  const parsed = parseArray<T>(raw, baseKey);
  if (parsed.reason) await recordStorageIssue(baseKey, userId, parsed.reason, raw);
  return parsed.values;
}

export function getStorageHealth(): StorageHealth {
  return { needsRecovery: storageIssues.size > 0, issues: Array.from(storageIssues.values()) };
}

export function clearStorageHealth(collection?: StorageCollection) {
  if (collection) storageIssues.delete(collection);
  else storageIssues.clear();
}

async function loadLocalOwner() {
  return AsyncStorage.getItem(LOCAL_OWNER_KEY);
}

async function loadScopedArray<T>(baseKey: string, userId: string | null) {
  if (userId) {
    const scopedRaw = await AsyncStorage.getItem(userScopedKey(baseKey, userId));
    if (scopedRaw !== null) return parseStoredArray<T>(baseKey, userId, scopedRaw);
    const owner = await loadLocalOwner();
    if (owner && owner !== ANONYMOUS_OWNER && owner !== userId) return [];
  } else {
    const owner = await loadLocalOwner();
    if (owner && owner !== ANONYMOUS_OWNER) return [];
  }
  return parseStoredArray<T>(baseKey, userId, await AsyncStorage.getItem(baseKey));
}

async function persistScopedArray<T>(baseKey: string, values: T[], userId: string | null) {
  if (!userId) {
    await AsyncStorage.setItem(baseKey, JSON.stringify(values));
    await AsyncStorage.setItem(LOCAL_OWNER_KEY, ANONYMOUS_OWNER);
    clearStorageHealth(collectionForKey(baseKey) || undefined);
    return;
  }
  await AsyncStorage.setItem(userScopedKey(baseKey, userId), JSON.stringify(values));
  await AsyncStorage.setItem(LOCAL_OWNER_KEY, userId);
  await AsyncStorage.removeItem(baseKey);
  clearStorageHealth(collectionForKey(baseKey) || undefined);
}

export async function persistWordEntries(words: WordEntry[]) {
  await persistScopedArray(KEY, words, await currentUserIdSafely());
}

export async function loadWordEntries(): Promise<WordEntry[]> {
  return loadScopedArray<WordEntry>(KEY, await currentUserIdSafely());
}

export async function upsertStoredWord(entry: WordEntry) {
  const words = await loadWordEntries();
  let found = false;
  const next = words.map((word) => {
    if (word.normalized_word !== entry.normalized_word) return word;
    found = true;
    return entry;
  });
  await persistWordEntries(found ? next : [...words, entry]);
  const userId = await currentUserIdSafely();
  if (userId) await clearDeletedWordTombstone(userId, entry.normalized_word);
}

export async function deleteStoredWord(id: string) {
  const words = await loadWordEntries();
  const removed = words.find((word) => word.id === id);
  await persistWordEntries(words.filter((word) => word.id !== id));
  const userId = await currentUserIdSafely();
  if (userId && removed) await recordDeletedWord(userId, removed.normalized_word);
}

export async function clearAllWords() {
  await persistWordEntries([]);
  const userId = await currentUserIdSafely();
  await AsyncStorage.removeItem(recoveryKey(KEY, userId));
  if (userId) await markCloudCollectionCleared(CLEARED_WORDS_KEY, userId);
}

export async function loadReviewSubmissions(): Promise<ReviewSubmission[]> {
  const submissions = await loadScopedArray<ReviewSubmission>(REVIEW_SUBMISSIONS_KEY, await currentUserIdSafely());
  return submissions.sort((a, b) => b.completed_at.localeCompare(a.completed_at));
}

export async function persistReviewSubmissions(submissions: ReviewSubmission[]) {
  await persistScopedArray(REVIEW_SUBMISSIONS_KEY, submissions, await currentUserIdSafely());
}

export async function clearAllReviewSubmissions() {
  await persistReviewSubmissions([]);
  const userId = await currentUserIdSafely();
  await AsyncStorage.removeItem(recoveryKey(REVIEW_SUBMISSIONS_KEY, userId));
  if (userId) await markCloudCollectionCleared(CLEARED_REVIEWS_KEY, userId);
}

export async function saveReviewSubmission(submission: ReviewSubmission): Promise<ReviewSubmission> {
  const existing = await loadReviewSubmissions();
  const next = [submission, ...existing.filter((item) => item.id !== submission.id)]
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at))
    .slice(0, 50);
  await persistReviewSubmissions(next);
  return submission;
}

export async function hasOnboarded() {
  const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
  return raw === 'yes';
}

export async function setOnboarded() { await AsyncStorage.setItem(ONBOARDING_KEY, 'yes'); }

export async function prepareLocalDataForSignOut(userId: string) {
  try {
    const [words, submissions] = await Promise.all([loadWordEntries(), loadReviewSubmissions()]);
    await Promise.all([
      AsyncStorage.setItem(userScopedKey(KEY, userId), JSON.stringify(words)),
      AsyncStorage.setItem(userScopedKey(REVIEW_SUBMISSIONS_KEY, userId), JSON.stringify(submissions)),
      AsyncStorage.setItem(LOCAL_OWNER_KEY, userId),
      AsyncStorage.removeItem(KEY),
      AsyncStorage.removeItem(REVIEW_SUBMISSIONS_KEY),
    ]);
  } catch {
    throw new Error('LOCAL_DATA_PROTECTION_FAILED');
  }
}

export async function clearLocalDataForUser(userId: string) {
  const [deletedWords, clearedWords, clearedReviews, owner] = await Promise.all([
    loadDeletedWordTombstones(),
    loadClearedCollections(CLEARED_WORDS_KEY),
    loadClearedCollections(CLEARED_REVIEWS_KEY),
    loadLocalOwner(),
  ]);
  const nextDeletedWords = deletedWords.filter((entry) => entry.user_id !== userId);
  const nextClearedWords = { ...clearedWords };
  const nextClearedReviews = { ...clearedReviews };
  delete nextClearedWords[userId];
  delete nextClearedReviews[userId];

  await Promise.all([
    AsyncStorage.removeItem(userScopedKey(KEY, userId)),
    AsyncStorage.removeItem(recoveryKey(KEY, userId)),
    AsyncStorage.removeItem(recoveryKey(REVIEW_SUBMISSIONS_KEY, userId)),
    AsyncStorage.removeItem(userScopedKey(REVIEW_SUBMISSIONS_KEY, userId)),
    AsyncStorage.setItem(DELETED_WORDS_KEY, JSON.stringify(nextDeletedWords)),
    AsyncStorage.setItem(CLEARED_WORDS_KEY, JSON.stringify(nextClearedWords)),
    AsyncStorage.setItem(CLEARED_REVIEWS_KEY, JSON.stringify(nextClearedReviews)),
    ...(owner === userId
      ? [
          AsyncStorage.removeItem(LOCAL_OWNER_KEY),
          AsyncStorage.removeItem(KEY),
          AsyncStorage.removeItem(REVIEW_SUBMISSIONS_KEY),
        ]
      : []),
  ]);
}

export async function loadDeletedWordTombstones(): Promise<DeletedWordTombstone[]> {
  const raw = await AsyncStorage.getItem(DELETED_WORDS_KEY);
  if (!raw) return [];
  try {
    const entries = JSON.parse(raw) as DeletedWordTombstone[];
    return Array.isArray(entries)
      ? entries.filter((entry) => !!entry?.user_id && !!entry?.normalized_word && !!entry?.deleted_at)
      : [];
  } catch {
    return [];
  }
}

export async function recordDeletedWord(userId: string, normalizedWord: string) {
  const existing = await loadDeletedWordTombstones();
  const next = [
    ...existing.filter((entry) => !(entry.user_id === userId && entry.normalized_word === normalizedWord)),
    { user_id: userId, normalized_word: normalizedWord, deleted_at: new Date().toISOString() },
  ];
  await AsyncStorage.setItem(DELETED_WORDS_KEY, JSON.stringify(next));
}

export async function clearDeletedWordTombstone(userId: string, normalizedWord: string) {
  const next = (await loadDeletedWordTombstones()).filter(
    (entry) => !(entry.user_id === userId && entry.normalized_word === normalizedWord),
  );
  await AsyncStorage.setItem(DELETED_WORDS_KEY, JSON.stringify(next));
}

export async function removeDeletedWordTombstones(userId: string, normalizedWords: string[]) {
  const deleted = new Set(normalizedWords);
  const next = (await loadDeletedWordTombstones()).filter(
    (entry) => entry.user_id !== userId || !deleted.has(entry.normalized_word),
  );
  await AsyncStorage.setItem(DELETED_WORDS_KEY, JSON.stringify(next));
}

export async function loadClearedCollections(key: typeof CLEARED_WORDS_KEY | typeof CLEARED_REVIEWS_KEY): Promise<UserTimestampMap> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return {};
  try {
    const value = JSON.parse(raw) as UserTimestampMap;
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export async function markCloudCollectionCleared(key: typeof CLEARED_WORDS_KEY | typeof CLEARED_REVIEWS_KEY, userId: string) {
  const next = await loadClearedCollections(key);
  next[userId] = new Date().toISOString();
  await AsyncStorage.setItem(key, JSON.stringify(next));
}

export async function clearCloudCollectionMarker(key: typeof CLEARED_WORDS_KEY | typeof CLEARED_REVIEWS_KEY, userId: string) {
  const next = await loadClearedCollections(key);
  delete next[userId];
  await AsyncStorage.setItem(key, JSON.stringify(next));
}

export const cloudStorageKeys = {
  clearedReviews: CLEARED_REVIEWS_KEY,
  clearedWords: CLEARED_WORDS_KEY,
} as const;

export function getStorageRecoveryKey(collection: StorageCollection, userId: string | null = null) {
  return recoveryKey(collection === 'words' ? KEY : REVIEW_SUBMISSIONS_KEY, userId);
}
