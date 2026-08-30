import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** A stable, same-origin download entrypoint. Set only a public HTTPS APK URL. */
export function GET() {
  const apkUrl = process.env.ANDROID_APK_DOWNLOAD_URL;
  if (!apkUrl) {
    return new NextResponse("The SocialRUSH Android app is not published yet.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const destination = new URL(apkUrl);
    if (destination.protocol !== "https:") throw new Error("APK URL must use HTTPS");
    return NextResponse.redirect(destination, { status: 302 });
  } catch {
    return new NextResponse("The Android app download is temporarily unavailable.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
