import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { ResponsivePage } from '../components/ResponsivePage';
import { ScreenHeader } from '../components/ScreenHeader';
import { WordEntry } from '../models/WordEntry';
import { recordReviewAnswer } from '../modules/savedWordCollection';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { buildReviewQuestion, nextReviewRound, ReviewQuestion, selectReviewAnswer, visibleReviewSelection } from '../modules/reviewSession';

export function ReviewScreen({ words, reload, goSearch }: { words: WordEntry[]; reload: () => Promise<void>; goSearch: () => void }) {
  const { isTabletUp } = useResponsiveLayout();
  const [round, setRound] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [question, setQuestion] = useState<ReviewQuestion | null>(() => buildReviewQuestion(words));
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (selected !== null) return;
    setQuestion(buildReviewQuestion(words));
  }, [words, round, selected]);
  if (!question) return <View style={styles.screen}><View style={[styles.content, isTabletUp && styles.contentWide]}><ResponsivePage><ScreenHeader title="Review" right="☘" /><EmptyState title="Add at least 4 words to start a quiz." subtitle="Your owl will make little quizzes from saved dictionary entries." button="Search Words" onPress={goSearch} /></ResponsivePage></View></View>;
  const q = question;
  const shownSelected = visibleReviewSelection(q, selected);
  async function answer(i: number) {
    if (shownSelected !== null) return;
    const result = selectReviewAnswer(q, i);
    setSelected(result.selectedIndex);
    await recordReviewAnswer(q.word, result.correct);
    await reload();
  }
  return (
    <View style={styles.screen}>
      <View style={[styles.content, isTabletUp && styles.contentWide]}>
        <ResponsivePage style={isTabletUp && styles.reviewPageWide}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isTabletUp && styles.titleWide]}>Review</Text>
            <Text style={[styles.plant, isTabletUp && styles.plantWide]}>🌿</Text>
          </View>
          <View style={[styles.quizCard, isTabletUp && styles.quizCardWide]}>
            <Text style={[styles.question, isTabletUp && styles.questionWide]}>What does{`\n`}“{q.word.word}” mean?</Text>
            {q.options.map((option, i) => {
              const chosen = shownSelected === i;
              const correct = shownSelected !== null && i === q.correctIndex;
              return <Pressable key={option} onPress={() => answer(i)} style={[styles.option, correct && styles.correct, chosen && !correct && styles.wrong]}><Text style={styles.optionText}>{String.fromCharCode(65 + i)})  {option}</Text><Text style={styles.mark}>{correct ? '✓' : chosen ? '×' : ''}</Text></Pressable>;
            })}
            <View style={styles.footer}><Text style={styles.progress}>{Math.min(round, 10)} / 10</Text>{shownSelected !== null && <Pressable style={styles.next} onPress={() => { setSelected(null); setRound(nextReviewRound); }}><Text style={styles.nextText}>Next</Text></Pressable>}</View>
          </View>
        </ResponsivePage>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 24 },
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
  option: { minHeight: 43, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.input, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 },
  mark: { color: colors.greenDark, fontWeight: '900', fontSize: 17, marginLeft: 6 },
  correct: { backgroundColor: colors.greenLight, borderColor: colors.green },
  wrong: { backgroundColor: '#FFF1ED', borderColor: colors.error },
  footer: { marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progress: { color: colors.greenDark, fontSize: 13, fontWeight: '800' },
  next: { backgroundColor: colors.green, borderRadius: 9, paddingHorizontal: 18, paddingVertical: 10 },
  nextText: { color: 'white', fontWeight: '900' },
});
