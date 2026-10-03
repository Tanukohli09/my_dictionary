import { Platform } from 'react-native';
import { getOfflineWordEntry } from '../data/offlineDictionary';
import { DictionaryDefinition, WordEntry } from '../models/WordEntry';
import { firstLetter, normalizeWord, titleCaseWord } from '../utils/normalizeWord';

const PUBLIC_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const configuredApi = typeof process !== 'undefined'
  ? process.env.EXPO_PUBLIC_DICTIONARY_API_URL?.replace(/\/$/, '')
  : undefined;
const isProductionBuild = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
const usesHostedDictionaryApi = Boolean(configuredApi) || (Platform.OS === 'web' && isProductionBuild);
const API = configuredApi || (
  Platform.OS === 'web'
    ? (isProductionBuild ? '/api/dictionary' : 'http://127.0.0.1:3001/api/dictionary')
    : PUBLIC_API
);
// Render free services can take about a minute to wake after idling. Keep the
// request alive long enough for that cold start; direct provider/dev lookups
// still use the shorter timeout.
const REQUEST_TIMEOUT_MS = usesHostedDictionaryApi ? 75_000 : 10_000;
const OFFLINE_FALLBACK_DELAY_MS = 1_500;
const offlineFallbackEnabled = typeof process !== 'undefined' && (
  process.env.EXPO_PUBLIC_OFFLINE_FALLBACK === 'true' || process.env.NODE_ENV === 'development'
);

export type DictionaryLookupDiagnostics = {
  provider: string | null;
  requestId: string | null;
  status: number | null;
  durationMs: number | null;
  outcome: 'idle' | 'success' | 'error' | 'offline-fallback';
};

let lastLookupDiagnostics: DictionaryLookupDiagnostics = {
  durationMs: null,
  outcome: 'idle',
  provider: null,
  requestId: null,
  status: null,
};

export function getDictionaryLookupDiagnostics(): DictionaryLookupDiagnostics {
  return { ...lastLookupDiagnostics };
}

function recordLookupDiagnostics({
  outcome,
  provider,
  requestId,
  startedAt,
  status,
}: {
  outcome: DictionaryLookupDiagnostics['outcome'];
  provider?: string | null;
  requestId?: string | null;
  startedAt: number;
  status?: number | null;
}) {
  lastLookupDiagnostics = {
    durationMs: Math.max(0, Date.now() - startedAt),
    outcome,
    provider: provider || null,
    requestId: requestId || null,
    status: status ?? null,
  };
}

function uniq(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).slice(0, 12);
}

export async function fetchWordEntry(input: string): Promise<WordEntry> {
  const normalized = normalizeWord(input);
  const offlineEntry = getOfflineWordEntry(normalized);

  if (offlineFallbackEnabled && offlineEntry && Platform.OS === 'web' && !configuredApi) {
    const remoteLookup = fetchRemoteWordEntry(normalized);
    const quickFallback = new Promise<WordEntry>((resolve) => setTimeout(() => resolve(offlineEntry), OFFLINE_FALLBACK_DELAY_MS));
    try {
      const result = await Promise.race([remoteLookup, quickFallback]);
      if (result === offlineEntry) {
        recordLookupDiagnostics({ outcome: 'offline-fallback', provider: 'offline', startedAt: Date.now() });
      }
      return result;
    } catch {
      recordLookupDiagnostics({ outcome: 'offline-fallback', provider: 'offline', startedAt: Date.now() });
      return offlineEntry;
    }
  }

  try {
    return await fetchRemoteWordEntry(normalized);
  } catch (error) {
    if (offlineFallbackEnabled && offlineEntry) {
      recordLookupDiagnostics({ outcome: 'offline-fallback', provider: 'offline', startedAt: Date.now() });
      return offlineEntry;
    }
    throw error;
  }
}

async function fetchRemoteWordEntry(normalized: string): Promise<WordEntry> {
  const startedAt = Date.now();
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;

  let data: unknown;
  let provider = configuredApi ? 'configured-provider' : 'dictionaryapi.dev';
  let response: Response | null = null;
  try {
    response = await fetch(`${API}/${encodeURIComponent(normalized)}`, controller ? { signal: controller.signal } : undefined);
    provider = response.headers.get('x-dictionary-provider') || provider;
    if (!response.ok) {
      if (response.status === 404) throw new Error('NOT_FOUND');
      if (response.status === 504) throw new Error('LOOKUP_TIMEOUT');
      if (response.status === 429) throw new Error('RATE_LIMITED');
      throw new Error('LOOKUP_FAILED');
    }
    data = await response.json();
  } catch (error) {
    if (error instanceof Error && ['NOT_FOUND', 'LOOKUP_TIMEOUT', 'RATE_LIMITED', 'LOOKUP_FAILED'].includes(error.message)) {
      recordLookupDiagnostics({
        outcome: 'error',
        provider,
        requestId: response?.headers.get('x-request-id'),
        startedAt,
        status: response?.status,
      });
      throw error;
    }
    const mappedError = error instanceof Error && error.name === 'AbortError' ? 'LOOKUP_TIMEOUT' : 'LOOKUP_FAILED';
    recordLookupDiagnostics({
      outcome: 'error',
      provider,
      requestId: response?.headers.get('x-request-id'),
      startedAt,
      status: response?.status,
    });
    throw new Error(mappedError);
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  const raw = Array.isArray(data) ? data[0] : null;
  if (!raw?.meanings?.length) {
    recordLookupDiagnostics({
      outcome: 'error',
      provider,
      requestId: response?.headers.get('x-request-id'),
      startedAt,
      status: response?.status,
    });
    throw new Error('NOT_FOUND');
  }

  const phonetic = raw.phonetic || raw.phonetics?.find((p: any) => p.text)?.text || null;
  const audio = raw.phonetics?.find((p: any) => p.audio)?.audio || null;
  const definitions: DictionaryDefinition[] = [];
  const examples: string[] = [];
  const synonyms: string[] = [];
  const antonyms: string[] = [];

  for (const meaning of raw.meanings || []) {
    synonyms.push(...(meaning.synonyms || []));
    antonyms.push(...(meaning.antonyms || []));
    for (const def of meaning.definitions || []) {
      if (!def.definition) continue;
      definitions.push({
        partOfSpeech: meaning.partOfSpeech || null,
        definition: def.definition,
        example: def.example || null,
        synonyms: def.synonyms || [],
        antonyms: def.antonyms || [],
      });
      if (def.example) examples.push(def.example);
      synonyms.push(...(def.synonyms || []));
      antonyms.push(...(def.antonyms || []));
    }
  }

  if (!definitions.length) {
    recordLookupDiagnostics({
      outcome: 'error',
      provider,
      requestId: response?.headers.get('x-request-id'),
      startedAt,
      status: response?.status,
    });
    throw new Error('NOT_FOUND');
  }
  const now = new Date().toISOString();
  recordLookupDiagnostics({
    outcome: 'success',
    provider,
    requestId: response?.headers.get('x-request-id'),
    startedAt,
    status: response?.status,
  });
  return {
    id: `${normalized}-${Date.now()}`,
    word: titleCaseWord(raw.word || normalized),
    normalized_word: normalized,
    first_letter: firstLetter(normalized),
    phonetic,
    audio_url: audio,
    part_of_speech: definitions[0]?.partOfSpeech || raw.meanings[0]?.partOfSpeech || null,
    meaning_short: definitions[0].definition,
    definitions: definitions.slice(0, 8),
    example: examples[0] || null,
    examples: uniq(examples),
    synonyms: uniq(synonyms),
    antonyms: uniq(antonyms),
    my_meaning: null,
    personal_note: null,
    is_favorite: false,
    search_count: 1,
    reviewed_count: 0,
    correct_count: 0,
    mastery_level: 0,
    source: provider,
    created_at: now,
    updated_at: now,
    last_searched_at: now,
  };
}
