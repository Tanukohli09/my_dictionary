import { WordEntry } from '../models/WordEntry';

export function groupAlphabetically(words: WordEntry[]) {
  return words.reduce<Record<string, WordEntry[]>>((groups, word) => {
    const letter = word.first_letter || word.normalized_word[0]?.toUpperCase() || '#';
    groups[letter] = groups[letter] || [];
    groups[letter].push(word);
    return groups;
  }, {});
}

export const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
