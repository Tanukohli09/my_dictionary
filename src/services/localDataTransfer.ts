import { Platform, Share } from 'react-native';
import { ReviewSubmission } from '../models/ReviewSubmission';
import { WordEntry, DictionaryDefinition } from '../models/WordEntry';
import { firstLetter, normalizeWord } from '../utils/normalizeWord';
import {
  loadReviewSubmissions,
  loadWordEntries,
  persistReviewSubmissions,
  persistWordEntries,
} from './wordStorage';

const BACKUP_FORMAT = 'my-dictionary-backup';
const BACKUP_VERSION = 1;

export type LocalDataBackup = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exported_at: string;
  words: WordEntry[];
  review_submissions: ReviewSubmission[];
};

export type ImportResult = {
  wordsImported: number;
  reviewsImported: number;
};

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && !!item.trim()).slice(0, 50) : [];
}

function timestamp(value: unknown, fallback: string) {
  const candidate = stringValue(value);
  return candidate && !Number.isNaN(new Date(candidate).getTime()) ? candidate : fallback;
}

function definitionValue(value: unknown): DictionaryDefinition | null {
  if (!isRecord(value) || !stringValue(value.definition).trim()) return null;
  return {
    partOfSpeech: stringValue(value.partOfSpeech) || null,
    definition: stringValue(value.definition).trim(),
    example: stringValue(value.example) || null,
    synonyms: stringArray(value.synonyms),
    antonyms: stringArray(value.antonyms),
  };
}

function importedWord(value: unknown, index: number): WordEntry | null {
  if (!isRecord(value)) return null;
  const rawWord = stringValue(value.word);
  const normalized = normalizeWord(stringValue(value.normalized_word) || rawWord);
  if (!normalized) return null;

  const now = new Date().toISOString();
  const definitions = (Array.isArray(value.definitions) ? value.definitions : [])
    .map(definitionValue)
    .filter((definition): definition is DictionaryDefinition => !!definition)
    .slice(0, 20);
  const meaning = stringValue(value.meaning_short).trim() || definitions[0]?.definition || '';
  if (!meaning) return null;

  return {
    id: stringValue(value.id) || `import-${normalized}-${index}-${Date.now()}`,
    word: rawWord.trim() || normalized,
    normalized_word: normalized,
    first_letter: firstLetter(normalized),
    phonetic: stringValue(value.phonetic) || null,
    audio_url: stringValue(value.audio_url) || null,
    part_of_speech: stringValue(value.part_of_speech) || definitions[0]?.partOfSpeech || null,
    meaning_short: meaning,
    definitions: definitions.length ? definitions : [{ partOfSpeech: stringValue(value.part_of_speech) || null, definition: meaning, example: stringValue(value.example) || null }],
    example: stringValue(value.example) || definitions[0]?.example || null,
    examples: stringArray(value.examples),
    synonyms: stringArray(value.synonyms),
    antonyms: stringArray(value.antonyms),
    my_meaning: stringValue(value.my_meaning) || null,
    personal_note: stringValue(value.personal_note) || null,
    is_favorite: value.is_favorite === true,
    search_count: numberValue(value.search_count),
    reviewed_count: numberValue(value.reviewed_count),
    correct_count: numberValue(value.correct_count),
    mastery_level: Math.min(5, numberValue(value.mastery_level)),
    source: stringValue(value.source) || 'imported',
    created_at: timestamp(value.created_at, now),
    updated_at: timestamp(value.updated_at, now),
    last_searched_at: timestamp(value.last_searched_at, now),
  };
}

function importedReview(value: unknown): ReviewSubmission | null {
  if (!isRecord(value)) return null;
  if (!stringValue(value.id) || !stringValue(value.completed_at)) return null;
  if (!Array.isArray(value.reviewed_words) || !Array.isArray(value.questions)) return null;
  if (!value.questions.length) return null;
  return value as ReviewSubmission;
}

export async function buildLocalDataBackup(): Promise<LocalDataBackup> {
  const [words, reviewSubmissions] = await Promise.all([loadWordEntries(), loadReviewSubmissions()]);
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    words,
    review_submissions: reviewSubmissions,
  };
}

export async function exportLocalData(): Promise<string> {
  return JSON.stringify(await buildLocalDataBackup(), null, 2);
}

export async function downloadOrShareLocalData() {
  const payload = await exportLocalData();
  if (Platform.OS === 'web' && typeof document !== 'undefined' && typeof URL !== 'undefined') {
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `my-dictionary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: 'My Dictionary backup', message: payload });
}

export async function selectLocalDataBackup(): Promise<string | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') throw new Error('IMPORT_UNSUPPORTED');
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';
    input.onchange = () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => reject(new Error('IMPORT_READ_FAILED'));
      reader.readAsText(file);
    };
    document.body.appendChild(input);
    input.click();
  });
}

export async function importLocalData(payload: string): Promise<ImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error('IMPORT_INVALID_FILE');
  }
  if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT || parsed.version !== BACKUP_VERSION) {
    throw new Error('IMPORT_UNSUPPORTED_FILE');
  }

  const words = (Array.isArray(parsed.words) ? parsed.words : [])
    .map(importedWord)
    .filter((word): word is WordEntry => !!word);
  const uniqueWords = Array.from(new Map(words.map((word) => [word.normalized_word, word])).values());
  const reviews = (Array.isArray(parsed.review_submissions) ? parsed.review_submissions : [])
    .map(importedReview)
    .filter((review): review is ReviewSubmission => !!review);

  const hasSourceData = (Array.isArray(parsed.words) && parsed.words.length > 0) || (Array.isArray(parsed.review_submissions) && parsed.review_submissions.length > 0);
  if (hasSourceData && !uniqueWords.length && !reviews.length) throw new Error('IMPORT_EMPTY_FILE');

  await persistWordEntries(uniqueWords);
  await persistReviewSubmissions(reviews);
  return { wordsImported: uniqueWords.length, reviewsImported: reviews.length };
}
