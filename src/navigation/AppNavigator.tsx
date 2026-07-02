import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppMenu } from '../components/AppMenu';
import { BottomTabs } from '../components/BottomTabs';
import { DesktopNavigation } from '../components/DesktopNavigation';
import { PhoneFrame } from '../components/PhoneFrame';
import { WordEntry } from '../models/WordEntry';
import { DictionaryScreen } from '../screens/DictionaryScreen';
import { NoteScreen } from '../screens/NoteScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SortScreen } from '../screens/SortScreen';
import { WordDetailScreen } from '../screens/WordDetailScreen';
import { WordResultScreen } from '../screens/WordResultScreen';
import { loadSavedWords } from '../modules/savedWordCollection';
import { hasOnboarded, setOnboarded } from '../services/wordStorage';
import { colors } from '../theme/colors';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { initialNavigationState, navigationFlowReducer, projectedScreen, requestedScreenFromUrl, shouldShowBottomTabs } from './navigationFlow';

export function AppNavigator() {
  const { isTabletUp } = useResponsiveLayout();
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboardedState] = useState(false);
  const [words, setWords] = useState<WordEntry[]>([]);
  const [nav, dispatch] = useReducer(navigationFlowReducer, undefined, () => initialNavigationState());
  const reload = useCallback(async () => setWords(await loadSavedWords()), []);

  useEffect(() => { (async () => {
    setOnboardedState(await hasOnboarded());
    const loaded = await loadSavedWords();
    setWords(loaded);
    const focus = loaded.find((word) => word.normalized_word === 'resilient') || loaded[0];
    dispatch({ type: 'hydrateFromUrl', screen: requestedScreenFromUrl(), focus });
    setReady(true);
  })(); }, []);

  useEffect(() => {
    if (!ready || Platform.OS !== 'web' || typeof window === 'undefined') return;
    const screen = projectedScreen(nav);
    const nextUrl = new URL(window.location.href);
    if (screen) nextUrl.searchParams.set('screen', screen);
    else nextUrl.searchParams.delete('screen');
    window.history.replaceState(null, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }, [ready, nav.route.name, nav.tab]);

  if (!ready) return <PhoneFrame><View style={{ flex: 1, backgroundColor: colors.background }} /></PhoneFrame>;
  if (!onboarded) return <PhoneFrame><OnboardingScreen onStart={async () => { await setOnboarded(); setOnboardedState(true); }} /></PhoneFrame>;

  function currentWord(word: WordEntry) { return words.find((entry) => entry.id === word.id) || word; }
  const goTabs = () => { reload(); dispatch({ type: 'backToTabs' }); };
  const onChanged = async (word: WordEntry) => { await reload(); dispatch({ type: 'replaceRouteWord', word }); };

  let content: React.ReactNode;
  if (nav.route.name === 'result') {
    const route = nav.route;
    content = <WordResultScreen word={currentWord(route.word)} created={route.created} onBack={goTabs} onChanged={onChanged} />;
  } else if (nav.route.name === 'detail') {
    const route = nav.route;
    content = <WordDetailScreen word={currentWord(route.word)} onBack={goTabs} onChanged={onChanged} openNote={(word) => dispatch({ type: 'openNote', word: currentWord(word) })} />;
  } else if (nav.route.name === 'note') {
    const route = nav.route;
    const word = currentWord(route.word);
    content = <NoteScreen word={word} onBack={() => dispatch({ type: 'backToDetail', word })} onSaved={async (saved) => { await reload(); dispatch({ type: 'backToDetail', word: saved }); }} />;
  } else if (nav.route.name === 'sort') {
    content = <SortScreen selected={nav.dictionarySort} onSelect={(sort) => dispatch({ type: 'selectSort', sort })} onBack={goTabs} />;
  } else {
    content = nav.tab === 'Search'
      ? <SearchScreen words={words} reload={reload} openResult={(word, created) => dispatch({ type: 'openResult', word, created })} openDetail={(word) => dispatch({ type: 'openDetail', word: currentWord(word) })} goDictionary={() => dispatch({ type: 'openTab', tab: 'Dictionary' })} onMenu={isTabletUp ? undefined : () => dispatch({ type: 'openMenu' })} />
      : nav.tab === 'Dictionary'
        ? <DictionaryScreen words={words} openDetail={(word) => dispatch({ type: 'openDetail', word: currentWord(word) })} goSearch={() => dispatch({ type: 'openTab', tab: 'Search' })} sort={nav.dictionarySort} onSortOpen={() => dispatch({ type: 'openSort' })} onMenu={isTabletUp ? undefined : () => dispatch({ type: 'openMenu' })} />
        : nav.tab === 'Review'
          ? <ReviewScreen words={words} reload={reload} goSearch={() => dispatch({ type: 'openTab', tab: 'Search' })} />
          : <ProfileScreen words={words} onBack={() => dispatch({ type: 'openTab', tab: 'Search' })} onDictionary={() => dispatch({ type: 'openTab', tab: 'Dictionary' })} onReview={() => dispatch({ type: 'openTab', tab: 'Review' })} />;
  }

  return (
    <PhoneFrame>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }} edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, flexDirection: isTabletUp ? 'row' : 'column' }}>
          {isTabletUp && <DesktopNavigation active={nav.tab} onChange={(tab) => dispatch({ type: 'openTab', tab })} />}
          <View style={{ flex: 1 }}>{content}</View>
        </View>
        {!isTabletUp && shouldShowBottomTabs(nav) && <BottomTabs active={nav.tab} onChange={(tab) => dispatch({ type: 'openTab', tab })} />}
        {!isTabletUp && <AppMenu visible={nav.menuOpen} active={nav.tab} onClose={() => dispatch({ type: 'closeMenu' })} onNavigate={(tab) => dispatch({ type: 'openTab', tab })} />}
      </SafeAreaView>
    </PhoneFrame>
  );
}
