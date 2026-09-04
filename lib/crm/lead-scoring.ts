export type ScoreReason = { points: number; reason: string };
export type ScoreInput = { classifications: string[]; hasVerifiedBusinessEmail: boolean; hasRecommendedService: boolean; usefulContactCount: number; hasOutboundEngagement: boolean; isBlocked: boolean; stale: boolean };

export function calculateLeadScore(input: ScoreInput) {
  if (input.isBlocked) return { score: 0, grade: "do_not_contact" as const, reasons: [{ points: -100, reason: "Do Not Contact" }] };
  const rules: Array<[boolean, number, string]> = [
    [input.classifications.includes("meeting_request"), 30, "Meeting request"], [input.classifications.includes("interested"), 30, "Interested reply"],
    [input.classifications.includes("needs_information"), 20, "Needs information"], [input.hasVerifiedBusinessEmail, 15, "Verified business email"],
    [input.hasRecommendedService, 10, "Recommended service available"], [input.usefulContactCount > 1, 10, "Multiple useful contacts"],
    [input.hasOutboundEngagement, 10, "Previous outbound engagement"], [input.classifications.includes("negative_reply"), -40, "Negative reply"],
    [input.classifications.includes("not_now"), -25, "Not now"], [input.classifications.includes("wrong_person"), -20, "Wrong person"], [input.stale, -20, "Stale without engagement"],
  ];
  const reasons = rules.filter(([active]) => active).map(([, points, reason]) => ({ points, reason }));
  const score = Math.max(0, Math.min(100, reasons.reduce((total, item) => total + item.points, 0)));
  return { score, grade: score >= 80 ? "hot" as const : score >= 60 ? "warm" as const : score >= 30 ? "nurture" as const : "low" as const, reasons };
}
