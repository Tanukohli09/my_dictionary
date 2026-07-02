import { Platform } from 'react-native';

export const typography = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
  sans: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'Arial' }),
};
