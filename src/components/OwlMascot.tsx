import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type OwlMascotVariant = 'hero' | 'search' | 'sort' | 'stamp';

const sources: Record<OwlMascotVariant, ImageSourcePropType> = {
  hero: require('../assets/owl-hero-alpha.png'),
  search: require('../assets/owl-search-alpha.png'),
  sort: require('../assets/owl-sort-alpha.png'),
  stamp: require('../assets/stamp-alpha.png'),
};

const ratios: Record<OwlMascotVariant, number> = {
  hero: 210 / 200,
  search: 79 / 84,
  sort: 160 / 145,
  stamp: 91 / 96,
};

const darkMatRadius: Record<OwlMascotVariant, number> = {
  hero: 26,
  search: 999,
  sort: 24,
  stamp: 999,
};

export function OwlMascot({ size = 86, variant = 'search' }: { size?: number; variant?: OwlMascotVariant }) {
  const { colors, isNightMode } = useTheme();
  const width = Math.round(size * ratios[variant]);
  const inset = Math.max(4, Math.round(size * (variant === 'hero' ? 0.035 : 0.055)));

  return (
    <View style={[styles.wrap, { width, height: size }]}> 
      {isNightMode && (
        <View
          testID="owl-dark-finish"
          style={[
            styles.darkMat,
            {
              backgroundColor: '#F3E2C7',
              borderColor: colors.border,
              borderRadius: darkMatRadius[variant],
              inset,
            },
          ]}
        />
      )}
      <Image source={sources[variant]} resizeMode="contain" style={[styles.image, isNightMode && { padding: inset }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  darkMat: {
    position: 'absolute',
    borderWidth: 1,
    opacity: 0.96,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  image: { width: '100%', height: '100%' },
});
