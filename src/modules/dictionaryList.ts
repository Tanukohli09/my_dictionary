import { SortMode, WordEntry } from '../models/WordEntry';
import { formatDate } from '../utils/dateUtils';

export type DictionaryListRow = { word: WordEntry; meta?: string };
export type DictionaryListSection = { letter: string; words: WordEntry[] };
export type PreparedDictionaryList = {
  mode: 'sections' | 'rows';
  rows: DictionaryListRow[];
  sections: DictionaryListSection[];
  letters: string[];
  empty: boolean;
};

export function prepareDictionaryList(words: WordEntry[], query: string, sort: SortMode): PreparedDictionaryList {
  const filtered = searchableWords(words).filter((word) => matchesQuery(word, query));
  const sorted = sortDictionaryWords(filtered, sort);
  const sections = shouldShowSections(sort) ? buildSections(sorted) : [];
  return {
    mode: shouldShowSections(sort) ? 'sections' : 'rows',
    rows: shouldShowSections(sort) ? [] : sorted.map((word) => ({ word, meta: rowMeta(word, sort) })),
    sections,
    letters: sections.map((section) => section.letter),
    empty: sorted.length === 0,
  };
}

export function emptyDictionaryTitle(sort: SortMode) {
  return sort === 'favourites' ? 'No bookmarked words yet.' : 'Your Dictionary is waiting for its first word.';
}

function searchableWords(words: WordEntry[]) {
  return words.filter((word) => !(word.source === 'demo' && word.word === 'Curious'));
}

function matchesQuery(word: WordEntry, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return word.word.toLowerCase().includes(normalized) || word.meaning_short.toLowerCase().includes(normalized);
}

function shouldShowSections(sort: SortMode) {
  return sort === 'alphabetical' || sort === 'favourites';
}

function rowMeta(word: WordEntry, sort: SortMode) {
  return sort === 'newest' ? `Added ${formatDate(word.created_at)}` : `Searched ${word.search_count} times`;
}

function sortDictionaryWords(words: WordEntry[], sort: SortMode) {
  const copy = [...words];
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
    case 'most_searched':
      return copy.sort((a, b) => b.search_count - a.search_count || a.normalized_word.localeCompare(b.normalized_word));
    case 'favourites':
      return copy.filter((word) => word.is_favorite).sort((a, b) => a.normalized_word.localeCompare(b.normalized_word));
    case 'alphabetical':
    default:
      return copy.sort((a, b) => a.normalized_word.localeCompare(b.normalized_word));
  }
}

function buildSections(words: WordEntry[]): DictionaryListSection[] {
  const groups = words.reduce<Record<string, WordEntry[]>>((acc, word) => {
    const letter = word.first_letter || word.normalized_word[0]?.toUpperCase() || '#';
    acc[letter] = acc[letter] || [];
    acc[letter].push(word);
    return acc;
  }, {});
  return Object.keys(groups).sort().map((letter) => ({ letter, words: groups[letter] }));
}
