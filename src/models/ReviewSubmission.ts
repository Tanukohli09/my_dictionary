export type ReviewSubmissionWord = {
  id: string;
  word: string;
};

export type ReviewSubmissionQuestion = {
  word_id: string;
  word: string;
  prompt: string;
  correct_answer: string;
  options: string[];
  selected_index: number;
  selected_answer: string;
  correct_index: number;
  correct: boolean;
  answered_at: string;
};

export type ReviewSubmission = {
  id: string;
  session_id: string;
  started_at: string;
  completed_at: string;
  total_questions: number;
  correct_answers: number;
  reviewed_words: ReviewSubmissionWord[];
  questions: ReviewSubmissionQuestion[];
};
