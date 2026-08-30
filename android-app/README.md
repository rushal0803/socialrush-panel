# SocialRUSH Android app

This is a Trusted Web Activity (TWA), package `com.getsocialrush.app`. It launches `https://www.getsocialrush.com/dashboard` in the user's trusted browser; it does not embed a WebView, credentials, payment secrets, or Supabase keys. Its launcher and Android 12 splash use the existing `public/images/brand/socialrush-icon.png` during the build.

## Release signing (one-time)

From `android-app`, generate a keystore outside this repository:

```powershell
keytool -genkeypair -v -keystore C:\secure\socialrush-release.jks -alias socialrush -keyalg RSA -keysize 4096 -validity 10000
keytool -list -v -keystore C:\secure\socialrush-release.jks -alias socialrush
```

Copy the displayed `SHA256:` certificate fingerprint into the hosting environment as `ANDROID_APP_SIGNING_CERT_SHA256` (colon-separated uppercase hex). Create the untracked `android-app/keystore.properties`:

```properties
storeFile=C:\\secure\\socialrush-release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=socialrush
keyPassword=YOUR_KEY_PASSWORD
```

Build the signed release APK:

```powershell
# In Android Studio: Open android-app, then Build > Generate Signed Bundle / APK > APK.
# Or, after installing a JDK 17+ and Gradle 8.7+:
gradle assembleRelease
```

The output is `app/build/outputs/apk/release/app-release.apk`. Rename it to `SocialRUSH.apk` when uploading to a stable HTTPS GitHub Release (or comparable release host), then set `ANDROID_APK_DOWNLOAD_URL` to its HTTPS URL. The stable customer link is `https://www.getsocialrush.com/download/android`.

For each release: increment `versionCode` and `versionName` in `app/build.gradle`, build with the same keystore, upload the APK, update `ANDROID_APK_DOWNLOAD_URL`, then deploy the website. Do not change the application ID or use a different signing key.

## Digital Asset Links and payments

Deploy `ANDROID_APP_SIGNING_CERT_SHA256` before installing the release build. Confirm `https://www.getsocialrush.com/.well-known/assetlinks.json` returns a target with the real fingerprint. Until then it safely returns `[]`, so the TWA uses normal Custom Tab behavior rather than claiming trust.

Cashfree checkout, wallet payments, and return URLs stay on the existing HTTPS website. Links outside the verified origin, payment-provider redirects, and payment-app intents are handled by Android/browser intent routing; the wrapper does not modify amounts or settlement.
