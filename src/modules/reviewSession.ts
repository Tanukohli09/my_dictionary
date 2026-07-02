import { WordEntry } from '../models/WordEntry';

export type ReviewQuestion = { word: WordEntry; options: string[]; correctIndex: number };
export type ReviewSelection = { selectedIndex: number; correct: boolean };
export type RandomAdapter = () => number;

export function buildReviewQuestion(words: WordEntry[], random: RandomAdapter = Math.random): ReviewQuestion | null {
  if (words.length < 4) return null;

  const shuffled = shuffle(words, random);
  const word = shuffled[0];
  const wrong = shuffled.slice(1).map((entry) => entry.meaning_short).filter(Boolean).slice(0, 3);
  const options = shuffle([word.meaning_short, ...wrong], random);
  return { word, options, correctIndex: options.indexOf(word.meaning_short) };
}

export function visibleReviewSelection(_question: ReviewQuestion, selectedIndex: number | null): number | null {
  return selectedIndex;
}

export function selectReviewAnswer(question: ReviewQuestion, selectedIndex: number): ReviewSelection {
  return { selectedIndex, correct: selectedIndex === question.correctIndex };
}

export function nextReviewRound(round: number) {
  return round >= 10 ? 1 : round + 1;
}

function shuffle<T>(items: T[], random: RandomAdapter) {
  return [...items]
    .map((item) => ({ item, rank: random() }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ item }) => item);
}
