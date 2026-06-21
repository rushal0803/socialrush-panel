import { permanentRedirect } from "next/navigation";

export default function LegacyServicePage() {
  permanentRedirect("/services");
}
