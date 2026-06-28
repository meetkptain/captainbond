import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';

// Safe check for window and Capacitor context
const getCapacitor = () => {
  if (typeof window !== 'undefined') {
    return (window as any).Capacitor;
  }
  return null;
};

export const isNativeApp = () => {
  return !!getCapacitor();
};

/**
 * Triggers lightweight haptic feedback (vibrations) on iOS/Android
 */
export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (!isNativeApp()) return;
  try {
    let impactStyle = ImpactStyle.Light;
    if (style === 'medium') impactStyle = ImpactStyle.Medium;
    if (style === 'heavy') impactStyle = ImpactStyle.Heavy;
    
    await Haptics.impact({ style: impactStyle });
  } catch (e) {
    console.warn('Haptic feedback not supported on this platform:', e);
  }
}

/**
 * Double vibration for important events (like Safe Word activation)
 */
export async function triggerHapticDouble() {
  if (!isNativeApp()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
    setTimeout(async () => {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }, 150);
  } catch (e) {
    console.warn('Double haptic feedback not supported:', e);
  }
}

/**
 * Opens the native device share sheet on iOS/Android
 */
export async function shareNative(title: string, text: string, url: string) {
  if (!isNativeApp()) return false;
  try {
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Partager',
    });
    return true;
  } catch (e) {
    console.warn('Native share failed or cancelled:', e);
    return false;
  }
}
