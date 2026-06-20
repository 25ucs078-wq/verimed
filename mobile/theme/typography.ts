import { Platform } from 'react-native';

export const typography = {
  fontFamily: {
    heading: Platform.select({ ios: 'SpaceGrotesk-Bold', android: 'SpaceGrotesk-Bold', default: 'System' }),
    body: Platform.select({ ios: 'Inter-Regular', android: 'Inter-Regular', default: 'System' }),
    semibold: Platform.select({ ios: 'Inter-SemiBold', android: 'Inter-SemiBold', default: 'System' }),
    mono: Platform.select({ ios: 'CourierNewPSMT', android: 'monospace', default: 'monospace' })
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    huge: 32,
    giant: 48
  }
};
