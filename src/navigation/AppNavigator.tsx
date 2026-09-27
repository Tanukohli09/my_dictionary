import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppMenu } from '../components/AppMenu';
import { BottomTabs } from '../components/BottomTabs';
import { DesktopNavigation } from '../components/DesktopNavigation';
import { ErrorState } from '../components/ErrorState';
import { PhoneFrame } from '../components/PhoneFrame';
import { WordEntry } from '../models/WordEntry';
import { DictionaryScreen } from '../screens/DictionaryScreen';
import { InfoScreen } from '../screens/InfoScreen';
import { NoteScreen } from '../screens/NoteScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SortScreen } from '../screens/SortScreen';
import { WordDetailScreen } from '../screens/WordDetailScreen';
import { WordResultScreen } from '../screens/WordResultScreen';
import { loadReviewSubmissions, loadSavedWords, removeSavedWord } from '../modules/savedWordCollection';
import { ReviewSubmission } from '../models/ReviewSubmission';
import { hasOnboarded, setOnboarded } from '../services/wordStorage';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useTheme } from '../theme/ThemeContext';
import { initialNavigationState, navigationFlowReducer, projectedScreen, requestedScreenFromUrl, shouldShowBottomTabs } from './navigationFlow';

export function AppNavigator() {
  const { isTabletUp } = useResponsiveLayout();
  const { colors } = useTheme();
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboardedState] = useState(false);
  const [words, setWords] = useState<WordEntry[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewSubmission[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [nav, dispatch] = useReducer(navigationFlowReducer, undefined, () => initialNavigationState());
  const loadLocalData = useCallback(async () => {
    const [loadedWords, loadedHistory] = await Promise.all([loadSavedWords(), loadReviewSubmissions()]);
    setWords(loadedWords);
    setReviewHistory(loadedHistory);
    return loadedWords;
  }, []);
  const reload = useCallback(async () => {
    try {
      await loadLocalData();
      setStorageError(null);
    } catch {
      setStorageError('We could not load your saved dictionary. Your data has not been changed.');
    }
  }, [loadLocalData]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [didOnboard, loaded, loadedHistory] = await Promise.all([hasOnboarded(), loadSavedWords(), loadReviewSubmissions()]);
        if (!mounted) return;
        setOnboardedState(didOnboard);
        setWords(loaded);
        setReviewHistory(loadedHistory);
        const focus = loaded.find((word) => word.normalized_word === 'resilient') || loaded[0];
        dispatch({ type: 'hydrateFromUrl', screen: requestedScreenFromUrl(), focus });
      } catch {
        if (mounted) setStorageError('We could not load your saved dictionary. Your data has not been changed.');
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!ready || Platform.OS !== 'web' || typeof window === 'undefined') return;
    const screen = projectedScreen(nav);
    const nextUrl = new URL(window.location.href);
    if (screen) nextUrl.searchParams.set('screen', screen);
    else nextUrl.searchParams.delete('screen');
    window.history.replaceState(null, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }, [ready, nav.route.name, nav.route.name === 'info' ? nav.route.kind : null, nav.tab]);

  if (!ready) return <PhoneFrame><View style={{ flex: 1, backgroundColor: colors.background }} /></PhoneFrame>;
  if (storageError) return <PhoneFrame><View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.page }}><ErrorState message={storageError} onRetry={reload} retryLabel="Retry loading data" /></View></PhoneFrame>;
  if (!onboarded) {
    return <PhoneFrame>{nav.route.name === 'info'
      ? <InfoScreen kind={nav.route.kind} onBack={() => dispatch({ type: 'backToTabs' })} />
      : <OnboardingScreen onStart={async () => { await setOnboarded(); setOnboardedState(true); }} onPrivacy={() => dispatch({ type: 'openInfo', kind: 'privacy' })} onSupport={() => dispatch({ type: 'openInfo', kind: 'support' })} />}</PhoneFrame>;
  }

  function currentWord(word: WordEntry) { return words.find((entry) => entry.id === word.id) || word; }
  const goTabs = () => { reload(); dispatch({ type: 'backToTabs' }); };
  const onChanged = async (word: WordEntry) => { await reload(); dispatch({ type: 'replaceRouteWord', word }); };
  const onDeleted = async (word: WordEntry) => { await removeSavedWord(word); await reload(); dispatch({ type: 'backToTabs' }); };

  let content: React.ReactNode;
  if (nav.route.name === 'info') {
    content = <InfoScreen kind={nav.route.kind} onBack={() => dispatch({ type: 'backToTabs' })} />;
  } else if (nav.route.name === 'result') {
    const route = nav.route;
    content = <WordResultScreen word={currentWord(route.word)} created={route.created} onBack={goTabs} onChanged={onChanged} />;
  } else if (nav.route.name === 'detail') {
    const route = nav.route;
    content = <WordDetailScreen word={currentWord(route.word)} onBack={goTabs} onChanged={onChanged} onDelete={() => onDeleted(currentWord(route.word))} openNote={(word) => dispatch({ type: 'openNote', word: currentWord(word) })} />;
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
          : <ProfileScreen words={words} reviewHistory={reviewHistory} onBack={() => dispatch({ type: 'openTab', tab: 'Search' })} onDictionary={() => dispatch({ type: 'openTab', tab: 'Dictionary' })} onFavourites={() => { dispatch({ type: 'selectSort', sort: 'favourites' }); dispatch({ type: 'openTab', tab: 'Dictionary' }); }} onReview={() => dispatch({ type: 'openTab', tab: 'Review' })} onPrivacy={() => dispatch({ type: 'openInfo', kind: 'privacy' })} onSupport={() => dispatch({ type: 'openInfo', kind: 'support' })} onDataChanged={reload} />;
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
