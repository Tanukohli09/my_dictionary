import { ReviewSubmission, ReviewSubmissionQuestion, ReviewSubmissionWord } from '../models/ReviewSubmission';
import { WordEntry } from '../models/WordEntry';

export type ReviewQuestion = { word: WordEntry; options: string[]; correctIndex: number };
export type ReviewSelection = { selectedIndex: number; correct: boolean };
export type RandomAdapter = () => number;
export type ClockAdapter = () => string;

export type ReviewSession = {
  id: string;
  started_at: string;
  totalQuestions: number;
  questions: ReviewQuestion[];
  currentIndex: number;
  answers: ReviewSubmissionQuestion[];
};

type ReviewSessionOptions = {
  id?: string;
  totalQuestions?: number;
  random?: RandomAdapter;
  now?: ClockAdapter;
};

type ReviewCandidate = { word: WordEntry; meaning: string; normalizedMeaning: string };
type ReviewOption = { text: string; correct: boolean };

const OPTION_COUNT = 4;
const DEFAULT_SESSION_LENGTH = 10;

export function createReviewSession(words: WordEntry[], options: ReviewSessionOptions = {}): ReviewSession | null {
  const totalQuestions = options.totalQuestions ?? DEFAULT_SESSION_LENGTH;
  const random = options.random ?? Math.random;
  const now = options.now ?? (() => new Date().toISOString());
  const candidates = reviewableCandidates(words, random);
  if (!candidates.length) return null;

  const questions = buildSessionCandidates(candidates, totalQuestions, random).map((candidate) => buildQuestionForCandidate(candidate, candidates, random));

  return {
    id: options.id ?? createSessionId(random),
    started_at: now(),
    totalQuestions,
    questions,
    currentIndex: 0,
    answers: [],
  };
}

export function currentReviewQuestion(session: ReviewSession): ReviewQuestion | null {
  return session.questions[session.currentIndex] ?? null;
}

export function answerReviewSessionQuestion(session: ReviewSession, selectedIndex: number, now: ClockAdapter = () => new Date().toISOString()): { session: ReviewSession; selection: ReviewSelection } {
  const question = currentReviewQuestion(session);
  if (!question) return { session, selection: { selectedIndex, correct: false } };
  const existingAnswer = session.answers[session.currentIndex];
  if (existingAnswer) return { session, selection: { selectedIndex: existingAnswer.selected_index, correct: existingAnswer.correct } };

  const selection = selectReviewAnswer(question, selectedIndex);
  const answer: ReviewSubmissionQuestion = {
    word_id: question.word.id,
    word: question.word.word,
    prompt: question.word.word,
    correct_answer: question.options[question.correctIndex],
    options: question.options,
    selected_index: selection.selectedIndex,
    selected_answer: question.options[selection.selectedIndex] ?? '',
    correct_index: question.correctIndex,
    correct: selection.correct,
    answered_at: now(),
  };

  return { session: { ...session, answers: [...session.answers, answer] }, selection };
}

export function advanceReviewSession(session: ReviewSession): ReviewSession {
  if (isReviewSessionComplete(session)) return session;
  if (!session.answers[session.currentIndex]) return session;
  return { ...session, currentIndex: Math.min(session.currentIndex + 1, session.questions.length - 1) };
}

export function isReviewSessionComplete(session: ReviewSession): boolean {
  return session.answers.length >= session.totalQuestions;
}

export function completeReviewSession(session: ReviewSession, completedAt: string = new Date().toISOString()): ReviewSubmission | null {
  if (!isReviewSessionComplete(session)) return null;
  const reviewedWords = uniqueReviewedWords(session.answers);
  return {
    id: session.id,
    session_id: session.id,
    started_at: session.started_at,
    completed_at: completedAt,
    total_questions: session.totalQuestions,
    correct_answers: session.answers.filter((answer) => answer.correct).length,
    reviewed_words: reviewedWords,
    questions: session.answers,
  };
}

export function buildReviewQuestion(words: WordEntry[], random: RandomAdapter = Math.random): ReviewQuestion | null {
  const candidates = reviewableCandidates(words, random);
  const picked = candidates[0];
  return picked ? buildQuestionForCandidate(picked, candidates, random) : null;
}

export function visibleReviewSelection(_question: ReviewQuestion, selectedIndex: number | null): number | null {
  return selectedIndex;
}

export function selectReviewAnswer(question: ReviewQuestion, selectedIndex: number): ReviewSelection {
  return { selectedIndex, correct: selectedIndex === question.correctIndex };
}

export function nextReviewRound(round: number) {
  return round >= DEFAULT_SESSION_LENGTH ? 1 : round + 1;
}

function reviewableCandidates(words: WordEntry[], random: RandomAdapter): ReviewCandidate[] {
  const seenWordIds = new Set<string>();
  const candidates = words
    .map(toReviewCandidate)
    .filter((candidate): candidate is ReviewCandidate => !!candidate)
    .filter((candidate) => {
      if (seenWordIds.has(candidate.word.id)) return false;
      seenWordIds.add(candidate.word.id);
      return true;
    });
  const uniqueMeaningCount = new Set(candidates.map((candidate) => candidate.normalizedMeaning)).size;
  if (uniqueMeaningCount < OPTION_COUNT) return [];

  return shuffle(candidates, random).filter((candidate) => distinctDistractorMeanings(candidates, candidate).length >= OPTION_COUNT - 1);
}

function buildSessionCandidates(candidates: ReviewCandidate[], totalQuestions: number, random: RandomAdapter): ReviewCandidate[] {
  const questions: ReviewCandidate[] = [];
  while (questions.length < totalQuestions) {
    const cycle = shuffle(candidates, random);
    questions.push(...cycle.slice(0, totalQuestions - questions.length));
  }
  return questions;
}

function buildQuestionForCandidate(picked: ReviewCandidate, candidates: ReviewCandidate[], random: RandomAdapter): ReviewQuestion {
  const wrongOptions = distinctDistractorMeanings(shuffle(candidates, random), picked).slice(0, OPTION_COUNT - 1);
  const optionItems = shuffle<ReviewOption>([
    { text: picked.meaning, correct: true },
    ...wrongOptions.map((text) => ({ text, correct: false })),
  ], random);

  return {
    word: picked.word,
    options: optionItems.map((option) => option.text),
    correctIndex: optionItems.findIndex((option) => option.correct),
  };
}

function toReviewCandidate(word: WordEntry): ReviewCandidate | null {
  const meaning = (word.my_meaning || word.meaning_short || '').trim();
  if (!meaning) return null;
  return { word, meaning, normalizedMeaning: normalizeMeaning(meaning) };
}

function distinctDistractorMeanings(candidates: ReviewCandidate[], picked: ReviewCandidate): string[] {
  const seen = new Set([picked.normalizedMeaning]);
  const meanings: string[] = [];

  for (const candidate of candidates) {
    if (seen.has(candidate.normalizedMeaning)) continue;
    seen.add(candidate.normalizedMeaning);
    meanings.push(candidate.meaning);
  }

  return meanings;
}

function uniqueReviewedWords(answers: ReviewSubmissionQuestion[]): ReviewSubmissionWord[] {
  const seen = new Set<string>();
  const words: ReviewSubmissionWord[] = [];
  for (const answer of answers) {
    if (seen.has(answer.word_id)) continue;
    seen.add(answer.word_id);
    words.push({ id: answer.word_id, word: answer.word });
  }
  return words;
}

function normalizeMeaning(meaning: string) {
  return meaning.replace(/\s+/g, ' ').trim().toLowerCase();
}

function createSessionId(random: RandomAdapter) {
  return `review-${Date.now()}-${Math.floor(random() * 1_000_000).toString().padStart(6, '0')}`;
}

function shuffle<T>(items: T[], random: RandomAdapter) {
  return [...items]
    .map((item) => ({ item, rank: random() }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ item }) => item);
}
