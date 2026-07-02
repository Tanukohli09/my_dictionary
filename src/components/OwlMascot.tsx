import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

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

export function OwlMascot({ size = 86, variant = 'search' }: { size?: number; variant?: OwlMascotVariant }) {
  const width = Math.round(size * ratios[variant]);
  return (
    <View style={[styles.wrap, { width, height: size }]}> 
      <Image source={sources[variant]} resizeMode="contain" style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
});
