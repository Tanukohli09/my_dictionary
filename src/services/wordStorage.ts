import AsyncStorage from '@react-native-async-storage/async-storage';
import { demoWords } from '../data/demoWords';
import { WordEntry } from '../models/WordEntry';

const KEY = 'my-dictionary.words.v1';
const ONBOARDING_KEY = 'my-dictionary.onboarded.v1';

export async function persistWordEntries(words: WordEntry[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(words));
}

export async function loadWordEntries(): Promise<WordEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return demoWords;
  try { return JSON.parse(raw); } catch { return []; }
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
}

export async function deleteStoredWord(id: string) {
  await persistWordEntries((await loadWordEntries()).filter((word) => word.id !== id));
}

export async function clearAllWords() { await persistWordEntries([]); }

export async function hasOnboarded() {
  const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
  return raw === null ? true : raw === 'yes';
}

export async function setOnboarded() { await AsyncStorage.setItem(ONBOARDING_KEY, 'yes'); }
