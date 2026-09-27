import { ReviewSubmission } from '../models/ReviewSubmission';

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function calculateCurrentStreak(submissions: ReviewSubmission[], now = new Date()) {
  const completedDays = new Set(
    submissions
      .map((submission) => new Date(submission.completed_at))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(dayKey),
  );
  if (!completedDays.size) return 0;

  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const cursor = completedDays.has(dayKey(today)) ? today : yesterday;
  if (!completedDays.has(dayKey(cursor))) return 0;

  let streak = 0;
  while (completedDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
