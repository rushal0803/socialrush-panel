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
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /account
Disallow: /orders
Disallow: /wallet
Disallow: /billing
Disallow: /new-campaign
Disallow: /order-summary
Disallow: /packages/checkout
Disallow: /packages/summary

Sitemap: ${SEO_SITE_URL}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
