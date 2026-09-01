/**
 * Identifies the official Android WebView wrapper without classifying normal
 * Android browsers as the app. Safe to call during server rendering.
 */
export function isSocialRushAndroidApp() {
  return typeof navigator !== "undefined" && navigator.userAgent.includes("SocialRUSHAndroid");
}
