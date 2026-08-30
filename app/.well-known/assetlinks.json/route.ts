import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const fingerprint = process.env.ANDROID_APP_SIGNING_CERT_SHA256?.trim().toUpperCase();
const validFingerprint = fingerprint && /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(fingerprint);

/** Set ANDROID_APP_SIGNING_CERT_SHA256 after generating the release keystore. */
export function GET() {
  const body = validFingerprint ? [{
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.getsocialrush.app",
      sha256_cert_fingerprints: [fingerprint],
    },
  }] : [];
  return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=300" } });
}
