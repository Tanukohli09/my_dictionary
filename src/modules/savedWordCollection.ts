import { fetchWordEntry } from '../services/dictionaryApi';
import { deleteStoredWord, loadReviewSubmissions as loadStoredReviewSubmissions, loadWordEntries, persistWordEntries, saveReviewSubmission as saveStoredReviewSubmission, upsertStoredWord } from '../services/wordStorage';
import { ReviewSubmission } from '../models/ReviewSubmission';
import { WordEntry } from '../models/WordEntry';
import { normalizeWord } from '../utils/normalizeWord';

export type SavedWordSearchResult = { entry: WordEntry; created: boolean };
export type DictionaryLookupAdapter = (input: string) => Promise<WordEntry>;

export async function loadSavedWords(): Promise<WordEntry[]> {
  return loadWordEntries();
}

export async function searchSavedWord(input: string, lookup: DictionaryLookupAdapter = fetchWordEntry): Promise<SavedWordSearchResult> {
  const normalized = normalizeWord(input);
  if (!normalized) throw new Error('BLANK_WORD');

  const words = await loadWordEntries();
  const existing = words.find((word) => word.normalized_word === normalized);
  if (existing) {
    const touched = touchSearch(existing);
    await persistWordEntries(words.map((word) => word.id === existing.id ? touched : word));
    return { entry: touched, created: false };
  }

  const entry = await lookup(normalized);
  const duplicate = words.find((word) => word.normalized_word === entry.normalized_word);
  if (duplicate) return { entry: duplicate, created: false };

  await persistWordEntries([...words, entry]);
  return { entry, created: true };
}

export async function saveSavedWord(entry: WordEntry): Promise<WordEntry> {
  const next = stampUpdated(entry);
  await upsertStoredWord(next);
  return next;
}

export async function toggleSavedWordFavourite(entry: WordEntry): Promise<WordEntry> {
  return saveSavedWord({ ...entry, is_favorite: !entry.is_favorite });
}

export async function saveSavedWordMeaning(entry: WordEntry, myMeaning: string): Promise<WordEntry> {
  return saveSavedWord({ ...entry, my_meaning: myMeaning });
}

export async function saveSavedWordNote(entry: WordEntry, note: string): Promise<WordEntry> {
  return saveSavedWord({ ...entry, personal_note: note });
}

export async function removeSavedWord(entry: WordEntry): Promise<void> {
  await deleteStoredWord(entry.id);
}

export async function recordReviewAnswer(entry: WordEntry, correct: boolean): Promise<WordEntry> {
  const words = await loadWordEntries();
  const current = words.find((word) => word.id === entry.id || word.normalized_word === entry.normalized_word) || entry;
  const correctCount = current.correct_count + (correct ? 1 : 0);
  return saveSavedWord({
    ...current,
    reviewed_count: current.reviewed_count + 1,
    correct_count: correctCount,
    mastery_level: Math.min(5, Math.floor(correctCount / 2)),
  });
}

export async function loadReviewSubmissions(): Promise<ReviewSubmission[]> {
  return loadStoredReviewSubmissions();
}

export async function saveReviewSubmission(submission: ReviewSubmission): Promise<ReviewSubmission> {
  return saveStoredReviewSubmission(submission);
}

function touchSearch(entry: WordEntry): WordEntry {
  const now = new Date().toISOString();
  return { ...entry, search_count: entry.search_count + 1, last_searched_at: now, updated_at: now };
}

function stampUpdated(entry: WordEntry): WordEntry {
  return { ...entry, updated_at: new Date().toISOString() };
}
