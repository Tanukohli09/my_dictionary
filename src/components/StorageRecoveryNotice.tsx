import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export function StorageRecoveryNotice({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View accessibilityRole="alert" style={styles.wrap}>
      <Text style={styles.message}>Some saved data could not be read. Your original storage is preserved while you recover it from a backup.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Open Profile to recover saved data" accessibilityHint="Open Profile where you can import a My Dictionary backup." onPress={onOpenProfile} style={styles.button}>
        <Text style={styles.buttonText}>Open Profile to recover</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  message: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 18 },
  button: { minHeight: 40, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 10 },
  buttonText: { color: colors.greenDark, fontSize: 12, fontWeight: '900' },
});
