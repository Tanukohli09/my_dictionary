import { Platform } from 'react-native';
import { TabName } from '../components/BottomTabs';
import { SortMode, WordEntry } from '../models/WordEntry';

export type AppRoute =
  | { name: 'tabs' }
  | { name: 'result'; word: WordEntry; created: boolean }
  | { name: 'detail'; word: WordEntry }
  | { name: 'note'; word: WordEntry }
  | { name: 'sort' };

export type AppNavigationState = {
  tab: TabName;
  route: AppRoute;
  dictionarySort: SortMode;
  menuOpen: boolean;
};

export type AppNavigationAction =
  | { type: 'openTab'; tab: TabName }
  | { type: 'openMenu' }
  | { type: 'closeMenu' }
  | { type: 'openResult'; word: WordEntry; created: boolean }
  | { type: 'openDetail'; word: WordEntry }
  | { type: 'openNote'; word: WordEntry }
  | { type: 'openSort' }
  | { type: 'selectSort'; sort: SortMode }
  | { type: 'backToTabs' }
  | { type: 'backToDetail'; word: WordEntry }
  | { type: 'replaceRouteWord'; word: WordEntry }
  | { type: 'hydrateFromUrl'; screen: string | null; focus?: WordEntry };

export function requestedScreenFromUrl() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('screen');
}

export function initialNavigationState(screen = requestedScreenFromUrl()): AppNavigationState {
  return {
    tab: tabForRequestedScreen(screen),
    route: screen === 'sort' ? { name: 'sort' } : { name: 'tabs' },
    dictionarySort: 'alphabetical',
    menuOpen: false,
  };
}

export function hydrateRouteFromUrl(state: AppNavigationState, screen: string | null, focus?: WordEntry): AppNavigationState {
  if (!focus) return screen === 'sort' ? { ...state, route: { name: 'sort' } } : state;
  if (screen === 'result') return { ...state, route: { name: 'result', word: focus, created: true } };
  if (screen === 'detail') return { ...state, route: { name: 'detail', word: focus } };
  if (screen === 'note') return { ...state, route: { name: 'note', word: focus } };
  if (screen === 'sort') return { ...state, route: { name: 'sort' } };
  return state;
}

export function navigationFlowReducer(state: AppNavigationState, action: AppNavigationAction): AppNavigationState {
  switch (action.type) {
    case 'openTab':
      return { ...state, tab: action.tab, route: { name: 'tabs' }, menuOpen: false };
    case 'openMenu':
      return { ...state, menuOpen: true };
    case 'closeMenu':
      return { ...state, menuOpen: false };
    case 'openResult':
      return { ...state, route: { name: 'result', word: action.word, created: action.created }, menuOpen: false };
    case 'openDetail':
      return { ...state, route: { name: 'detail', word: action.word }, menuOpen: false };
    case 'openNote':
      return { ...state, route: { name: 'note', word: action.word }, menuOpen: false };
    case 'openSort':
      return { ...state, route: { name: 'sort' }, menuOpen: false };
    case 'selectSort':
      return { ...state, dictionarySort: action.sort };
    case 'backToTabs':
      return { ...state, route: { name: 'tabs' }, menuOpen: false };
    case 'backToDetail':
      return { ...state, route: { name: 'detail', word: action.word }, menuOpen: false };
    case 'replaceRouteWord':
      return replaceRouteWord(state, action.word);
    case 'hydrateFromUrl':
      return hydrateRouteFromUrl(state, action.screen, action.focus);
  }
}

export function projectedScreen(state: AppNavigationState) {
  return state.route.name === 'tabs' ? (state.tab === 'Search' ? null : state.tab.toLowerCase()) : state.route.name;
}

export function shouldShowBottomTabs(state: AppNavigationState) {
  return state.route.name === 'tabs' && !state.menuOpen;
}

function tabForRequestedScreen(screen: string | null): TabName {
  if (screen === 'dictionary' || screen === 'sort') return 'Dictionary';
  if (screen === 'review') return 'Review';
  if (screen === 'profile') return 'Profile';
  return 'Search';
}

function replaceRouteWord(state: AppNavigationState, word: WordEntry): AppNavigationState {
  if (state.route.name === 'result') return { ...state, route: { ...state.route, word } };
  if (state.route.name === 'detail') return { ...state, route: { ...state.route, word } };
  if (state.route.name === 'note') return { ...state, route: { ...state.route, word } };
  return state;
}
