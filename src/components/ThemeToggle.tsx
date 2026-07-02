import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { colors, isNightMode, toggleNightMode } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isNightMode }}
      accessibilityLabel="Toggle night mode"
      onPress={toggleNightMode}
      style={[styles.wrap, compact && styles.compact]}
    >
      <View style={[styles.track, isNightMode && styles.trackOn]}>
        <View style={[styles.thumb, isNightMode && styles.thumbOn]}>
          <Text style={styles.icon}>{isNightMode ? '☾' : '☀'}</Text>
        </View>
      </View>
      {!compact && (
        <View style={styles.copy}>
          <Text style={styles.title}>{isNightMode ? 'Night mode' : 'Day mode'}</Text>
          <Text style={styles.subtitle}>{isNightMode ? 'Tap to switch to warm daylight' : 'Tap for softer evening colors'}</Text>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, borderRadius: 14, padding: 12 },
  compact: { alignSelf: 'flex-start', paddingVertical: 8 },
  track: { width: 52, height: 30, borderRadius: 999, backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, padding: 3, justifyContent: 'center' },
  trackOn: { backgroundColor: colors.greenLight, borderColor: colors.green },
  thumb: { width: 22, height: 22, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardLight },
  thumbOn: { transform: [{ translateX: 22 }], backgroundColor: colors.page },
  icon: { color: colors.text, fontSize: 12, lineHeight: 16 },
  copy: { flex: 1 },
  title: { fontFamily: typography.sans, color: colors.text, fontSize: 13, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
