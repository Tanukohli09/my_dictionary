import { Platform, useWindowDimensions } from 'react-native';
import { breakpoints } from '../theme/breakpoints';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isTabletUp = width >= breakpoints.tablet;
  const isDesktop = width >= breakpoints.desktop;
  const isWide = width >= breakpoints.wide;

  return {
    width,
    height,
    isWeb,
    isTabletUp,
    isDesktop,
    isWide,
    isMobile: !isTabletUp,
    contentPadding: isDesktop ? 36 : isTabletUp ? 30 : 22,
  };
}
