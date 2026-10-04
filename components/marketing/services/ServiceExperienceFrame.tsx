import type { ReactNode } from "react";

/** Service content stays visible in initial HTML without motion hydration. */
export default function ServiceExperienceFrame({ children }: { children: ReactNode }) {
  return <div className="relative isolate">{children}</div>;
}
