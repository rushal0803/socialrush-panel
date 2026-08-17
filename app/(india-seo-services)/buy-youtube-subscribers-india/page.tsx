import { permanentRedirect } from "next/navigation";

// This former India-keyword route duplicated the established commercial page.
// Preserve its accumulated signals while keeping one crawlable purchase URL.
export default function Page() {
  permanentRedirect("/youtube-subscribers");
}
