import { NextResponse } from "next/server";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

export const dynamic = "force-static";

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /packages/checkout

Sitemap: ${SEO_SITE_URL}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
