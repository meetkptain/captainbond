import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Purchases } from '@revenuecat/purchases-capacitor';

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

/**
 * Initializes the RevenueCat SDK with the player's Supabase User ID
 */
export async function initializePurchases(userId: string) {
  if (!isNativeApp()) return;
  try {
    const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const apiKey = isIOS
      ? process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || ''
      : process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY || '';
    
    if (!apiKey) {
      console.warn('RevenueCat API Key missing. Skipping configuration.');
      return;
    }

    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });
    console.log('RevenueCat configured successfully for user:', userId);
  } catch (e) {
    console.error('Failed to configure RevenueCat Purchases:', e);
  }
}

/**
 * Triggers native App Store / Play Store purchase for a given RevenueCat Package
 */
export async function purchaseNativeProduct(packageIdentifier: string) {
  if (!isNativeApp()) return null;
  try {
    // 1. Get current offerings
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;
    if (!currentOffering) {
      console.error('No active offerings found in RevenueCat');
      return null;
    }

    // 2. Find package by identifier (e.g. "pass_24h" or "profile")
    const rcPackage = currentOffering.availablePackages.find(
      (pkg) => pkg.identifier === packageIdentifier
    );
    
    if (!rcPackage) {
      console.error(`Package ${packageIdentifier} not found in available offerings`);
      return null;
    }

    // 3. Trigger purchase
    const purchaseResult = await Purchases.purchasePackage({ aPackage: rcPackage });
    return purchaseResult;
  } catch (e) {
    console.error('Native In-App Purchase execution failed:', e);
    return null;
  }
}
