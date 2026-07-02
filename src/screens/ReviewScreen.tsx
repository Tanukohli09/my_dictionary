import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ResponsivePage } from '../components/ResponsivePage';
import { ScreenHeader } from '../components/ScreenHeader';
import { ReviewSubmission } from '../models/ReviewSubmission';
import { WordEntry } from '../models/WordEntry';
import { loadReviewSubmissions, recordReviewAnswer, saveReviewSubmission } from '../modules/savedWordCollection';
import { advanceReviewSession, answerReviewSessionQuestion, completeReviewSession, createReviewSession, currentReviewQuestion, isReviewSessionComplete, ReviewSession, visibleReviewSelection } from '../modules/reviewSession';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export function ReviewScreen({ words, reload, goSearch }: { words: WordEntry[]; reload: () => Promise<void>; goSearch: () => void }) {
  const { isTabletUp } = useResponsiveLayout();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [session, setSession] = useState<ReviewSession | null>(() => createReviewSession(words));
  const [history, setHistory] = useState<ReviewSubmission[]>([]);
  const savedSessionIds = useRef(new Set<string>());

  useEffect(() => { refreshHistory(); }, []);

  useEffect(() => {
    if (session || !words.length) return;
    setSession(createReviewSession(words));
  }, [words, session]);

  async function refreshHistory() {
    setHistory(await loadReviewSubmissions());
  }

  function startNewReview() {
    setSession(createReviewSession(words));
  }

  const question = session ? currentReviewQuestion(session) : null;
  const activeAnswer = session?.answers[session.currentIndex] ?? null;
  const completed = !!session && isReviewSessionComplete(session);

  if (!question && !completed) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content, isTabletUp && styles.contentWide]} showsVerticalScrollIndicator={false}>
        <ResponsivePage>
          <ScreenHeader title="Review" right="☘" />
          <EmptyState title="Add at least 4 words with different meanings to start a quiz." subtitle="Your owl will make clear quizzes from saved dictionary entries." button="Search Words" onPress={goSearch} />
          <ReviewHistoryList history={history} styles={styles} isTabletUp={isTabletUp} />
        </ResponsivePage>
      </ScrollView>
    );
  }

  async function answer(i: number) {
    if (!session || !question || activeAnswer) return;
    const answered = answerReviewSessionQuestion(session, i);
    setSession(answered.session);
    await recordReviewAnswer(question.word, answered.selection.correct);
    await reload();

    if (isReviewSessionComplete(answered.session) && !savedSessionIds.current.has(answered.session.id)) {
      const submission = completeReviewSession(answered.session);
      if (submission) {
        savedSessionIds.current.add(answered.session.id);
        await saveReviewSubmission(submission);
        await refreshHistory();
      }
    }
  }

  const shownSelected = question && activeAnswer ? visibleReviewSelection(question, activeAnswer.selected_index) : null;
  const correctCount = session?.answers.filter((answer) => answer.correct).length ?? 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, isTabletUp && styles.contentWide]} showsVerticalScrollIndicator={false}>
      <ResponsivePage style={isTabletUp && styles.reviewPageWide}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isTabletUp && styles.titleWide]}>Review</Text>
            <Text style={[styles.plant, isTabletUp && styles.plantWide]}>🌿</Text>
          </View>
          {completed ? (
            <View style={[styles.quizCard, isTabletUp && styles.quizCardWide]}>
              <Text style={[styles.question, isTabletUp && styles.questionWide]}>Review complete!</Text>
              <Text style={styles.summaryText}>You answered {correctCount} of {session.totalQuestions} questions correctly.</Text>
              <PrimaryButton title="Start another review" onPress={startNewReview} />
            </View>
          ) : question ? (
            <View style={[styles.quizCard, isTabletUp && styles.quizCardWide]}>
              <Text style={[styles.question, isTabletUp && styles.questionWide]}>What does{`\n`}“{question.word.word}” mean?</Text>
              {question.options.map((option, i) => {
                const chosen = shownSelected === i;
                const correct = shownSelected !== null && i === question.correctIndex;
                return <Pressable key={`${question.word.id}-${i}-${option}`} onPress={() => answer(i)} style={[styles.option, correct && styles.correct, chosen && !correct && styles.wrong]}><Text style={styles.optionText}>{String.fromCharCode(65 + i)})  {option}</Text><Text style={styles.mark}>{correct ? '✓' : chosen ? '×' : ''}</Text></Pressable>;
              })}
              <View style={styles.footer}><Text style={styles.progress}>{Math.min(session!.currentIndex + 1, session!.totalQuestions)} / {session!.totalQuestions}</Text>{shownSelected !== null && <Pressable style={styles.next} onPress={() => setSession((current) => current ? advanceReviewSession(current) : current)}><Text style={styles.nextText}>Next</Text></Pressable>}</View>
            </View>
          ) : null}
          <ReviewHistoryList history={history} styles={styles} isTabletUp={isTabletUp} />
      </ResponsivePage>
    </ScrollView>
  );
}

function ReviewHistoryList({ history, styles, isTabletUp }: { history: ReviewSubmission[]; styles: ReviewStyles; isTabletUp: boolean }) {
  return (
    <View style={[styles.history, isTabletUp && styles.historyWide]}>
      <Text style={[styles.historyTitle, isTabletUp && styles.historyTitleWide]}>Previous reviews</Text>
      {!history.length ? <Text style={styles.historyEmpty}>Complete a review to see your submissions here.</Text> : history.slice(0, 5).map((submission) => {
        const completedAt = new Date(submission.completed_at);
        const dateLabel = Number.isNaN(completedAt.getTime()) ? submission.completed_at : completedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return (
          <View key={submission.id} style={styles.historyCard} testID="review-history-item">
            <View style={styles.historyRow}>
              <Text style={styles.historyScore}>{submission.correct_answers}/{submission.total_questions}</Text>
              <Text style={styles.historyDate}>{dateLabel}</Text>
            </View>
            <Text style={styles.historyWords} numberOfLines={2}>{submission.reviewed_words.map((word) => word.word).join(', ')}</Text>
          </View>
        );
      })}
    </View>
  );
}

type ReviewStyles = ReturnType<typeof createStyles>;

const createStyles = (colors: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 30, paddingBottom: 24 },
  contentWide: { paddingHorizontal: 40, paddingTop: 44, paddingBottom: 44 },
  reviewPageWide: { maxWidth: 760 },
  titleRow: { marginBottom: 16 },
  title: { fontFamily: typography.serif, color: colors.text, fontSize: 22, fontWeight: '800' },
  titleWide: { textAlign: 'center', fontSize: 34 },
  plant: { position: 'absolute', right: 2, top: 12, fontSize: 38 },
  plantWide: { right: 36, top: 4, fontSize: 46 },
  quizCard: { backgroundColor: colors.cardLight, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 14, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  quizCardWide: { padding: 28, borderRadius: 20 },
  question: { fontFamily: typography.serif, fontSize: 19, lineHeight: 25, color: colors.text, textAlign: 'center', fontWeight: '700', marginBottom: 16 },
  questionWide: { fontSize: 28, lineHeight: 36, marginBottom: 24 },
  summaryText: { color: colors.muted, textAlign: 'center', fontSize: 14, lineHeight: 21, marginBottom: 16 },
  option: { minHeight: 43, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.input, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 },
  mark: { color: colors.greenDark, fontWeight: '900', fontSize: 17, marginLeft: 6 },
  correct: { backgroundColor: colors.greenLight, borderColor: colors.green },
  wrong: { backgroundColor: colors.card, borderColor: colors.error },
  footer: { marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progress: { color: colors.greenDark, fontSize: 13, fontWeight: '800' },
  next: { backgroundColor: colors.green, borderRadius: 9, paddingHorizontal: 18, paddingVertical: 10 },
  nextText: { color: 'white', fontWeight: '900' },
  history: { marginTop: 18, gap: 10 },
  historyWide: { marginTop: 24 },
  historyTitle: { color: colors.text, fontWeight: '900', fontSize: 15 },
  historyTitleWide: { fontSize: 18 },
  historyEmpty: { color: colors.muted, backgroundColor: colors.cardLight, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 19 },
  historyCard: { backgroundColor: colors.cardLight, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 12 },
  historyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 },
  historyScore: { color: colors.greenDark, fontWeight: '900', fontSize: 16 },
  historyDate: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  historyWords: { color: colors.text, fontSize: 12, lineHeight: 18 },
});
