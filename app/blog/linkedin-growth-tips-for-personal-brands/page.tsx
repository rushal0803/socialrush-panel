import { permanentRedirect } from "next/navigation";

// Preserve the historical GSC-crawled URL and consolidate it into the
// already published article. Do not create a second indexable blog page.
export default function LegacyLinkedInPersonalBrandsBlogPage() {
  permanentRedirect("/blog/linkedin-growth-tips-personal-brands");
}
