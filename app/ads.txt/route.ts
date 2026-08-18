import { NextResponse } from "next/server";

// This ID matches the verified global AdSense account metadata in app/layout.tsx.
export const dynamic = "force-static";

export function GET() {
  return new NextResponse(
    "google.com, pub-5748505888279439, DIRECT, f08c47fec0942fa0\n",
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
