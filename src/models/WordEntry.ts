export type DictionaryDefinition = {
  partOfSpeech: string | null;
  definition: string;
  example?: string | null;
  synonyms?: string[];
  antonyms?: string[];
};

export type WordEntry = {
  id: string;
  word: string;
  normalized_word: string;
  first_letter: string;
  phonetic: string | null;
  audio_url: string | null;
  part_of_speech: string | null;
  meaning_short: string;
  definitions: DictionaryDefinition[];
  example: string | null;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
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

export type SortMode = 'alphabetical' | 'newest' | 'most_searched' | 'favourites';
