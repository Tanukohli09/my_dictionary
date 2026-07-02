import { DictionaryDefinition, WordEntry } from '../models/WordEntry';
import { firstLetter, normalizeWord, titleCaseWord } from '../utils/normalizeWord';

const API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

function uniq(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).slice(0, 12);
}

export async function fetchWordEntry(input: string): Promise<WordEntry> {
  const normalized = normalizeWord(input);
  const response = await fetch(`${API}/${encodeURIComponent(normalized)}`);
  if (!response.ok) throw new Error('NOT_FOUND');
  const data = await response.json();
  const raw = Array.isArray(data) ? data[0] : null;
  if (!raw?.meanings?.length) throw new Error('NOT_FOUND');

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

  if (!definitions.length) throw new Error('NOT_FOUND');
  const now = new Date().toISOString();
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
    source: 'dictionaryapi.dev',
    created_at: now,
    updated_at: now,
    last_searched_at: now,
  };
}
