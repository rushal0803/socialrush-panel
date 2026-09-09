# Free SEO monitoring checklist

This checklist uses Google Search Console and the repository's weekly GitHub Actions monitor. No paid SEO subscription is required.

## One-time actions after Phase 13 is live

1. Open the `getsocialrush.com` property in Google Search Console.
2. Go to **Indexing → Sitemaps** and submit `https://www.getsocialrush.com/sitemap.xml`.
3. Use **URL inspection** for the priority pages below. Confirm the declared and Google-selected canonical URLs match, then request indexing where Google has not indexed the page.
4. Submit a small batch each day. Do not request indexing for redirected or `noindex` URLs.
5. For the old `/services/facebook-shares` issue, inspect the URL after deployment. It should redirect to `/buy-facebook-shares-india`; the destination—not the old URL—should be indexed.

Priority pages:

- `/buy-instagram-followers-india`
- `/instagram-likes`
- `/instagram-views`
- `/youtube-subscribers`
- `/youtube-views`
- `/linkedin-followers`
- `/twitter-followers`
- `/buy-facebook-followers-india`
- `/telegram-members`
- `/tiktok-followers`

## Weekly Search Console check

In **Performance → Search results**:

1. Set **Search type** to Web.
2. Set **Country** to India.
3. Compare the last 28 days with the previous 28 days.
4. Review clicks, impressions, CTR, and average position by both **Pages** and **Queries**.
5. Record the top query and those four metrics for every priority page.

Also review **Page indexing** and **Sitemaps**. Investigate a service page if it becomes excluded, the Google-selected canonical changes, or clicks and impressions fall for two consecutive weekly checks.

## Automated check

The **Weekly SEO health monitor** workflow runs every Monday at 09:05 IST. It checks:

- `robots.txt` and the sitemap;
- all 20 canonical India service pages;
- canonical tags and accidental `noindex` directives;
- sitemap inclusion for priority pages and tools; and
- important legacy redirects.

It can also be run manually from **GitHub → Actions → Weekly SEO health monitor → Run workflow**, or locally with:

```bash
npm run seo:check
```

An automated failure is a technical warning, not proof of a ranking loss. Open the failed job to see the exact URL and issue before making changes.

## What success looks like

Technical SEO can make pages eligible to rank, but it cannot guarantee a top position or a fixed date. Judge progress over 8–12 weeks: first stable indexing and impressions, then stronger query positions, clicks, and qualified orders. Keep improving useful content, internal links, real reviews/case studies, and relevant mentions while the data accumulates.
