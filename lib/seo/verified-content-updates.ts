/**
 * Real, reviewed public-content release dates (India local calendar).
 * Keep this separate from historical phase-5 entries: do not rewrite older
 * release dates or date-stamp unrelated pages on every deployment.
 *
 * 2026-10-19:
 * - PR #696: six commercial service pages gained distinct buyer guidance.
 * - PR #697: two public calculators gained contextual service explanations.
 * - PR #698: two educational guides gained substantial new sections.
 */
export const VERIFIED_CONTENT_RELEASE_DATE = "2026-10-19" as const;

export const verifiedContentUpdates: Readonly<Record<string, string>> = Object.freeze({
  "/buy-instagram-comments-india": VERIFIED_CONTENT_RELEASE_DATE,
  "/buy-instagram-saves-india": VERIFIED_CONTENT_RELEASE_DATE,
  "/buy-instagram-shares-india": VERIFIED_CONTENT_RELEASE_DATE,
  "/buy-youtube-comments-india": VERIFIED_CONTENT_RELEASE_DATE,
  "/buy-youtube-watch-hours-india": VERIFIED_CONTENT_RELEASE_DATE,
  "/buy-facebook-group-members-india": VERIFIED_CONTENT_RELEASE_DATE,
  "/tools/instagram-engagement-rate-calculator": VERIFIED_CONTENT_RELEASE_DATE,
  "/tools/youtube-watch-time-calculator": VERIFIED_CONTENT_RELEASE_DATE,
  "/blog/choose-the-right-social-media-service": VERIFIED_CONTENT_RELEASE_DATE,
  "/blog/how-social-media-growth-campaigns-work": VERIFIED_CONTENT_RELEASE_DATE,
});
