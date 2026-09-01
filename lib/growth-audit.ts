export type AuditPlatform = "instagram" | "youtube" | "facebook" | "x";

export type AuditInput = {
  platform: AuditPlatform;
  audience: number;
  likes: number;
  comments: number;
  views?: number;
  postsPerMonth: number;
};

export type GrowthAudit = {
  score: number;
  engagementRate: number | null;
  reachRatio: number | null;
  consistency: "Strong" | "Good" | "Needs Improvement";
  strongestArea: string;
  biggestOpportunity: string;
  explanation: string;
  recommendations: string[];
  suggestedGoal: "followers" | "views" | "engagement";
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

/** A transparent advisory heuristic based only on the metrics a visitor enters. */
export function calculateGrowthAudit(input: AuditInput): GrowthAudit {
  const audience = Math.max(0, input.audience || 0);
  const interactions = Math.max(0, input.likes || 0) + Math.max(0, input.comments || 0);
  const engagementRate = audience > 0 ? (interactions / audience) * 100 : null;
  const reachRatio = audience > 0 && input.views && input.views > 0 ? (input.views / audience) * 100 : null;
  const engagementPoints = engagementRate === null ? 22 : clamp(engagementRate * 11, 8, 38);
  const reachPoints = reachRatio === null ? 16 : clamp(reachRatio * 0.28, 8, 32);
  const consistencyPoints = clamp((Math.max(0, input.postsPerMonth) / 12) * 30, 4, 30);
  const score = Math.round(clamp(engagementPoints + reachPoints + consistencyPoints));
  const consistency = input.postsPerMonth >= 8 ? "Strong" : input.postsPerMonth >= 4 ? "Good" : "Needs Improvement";

  const weakReach = reachRatio === null || reachRatio < 35;
  const weakConsistency = input.postsPerMonth < 4;
  const weakEngagement = engagementRate === null || engagementRate < 2;
  const strongestArea = !weakEngagement ? "Audience engagement" : !weakReach ? "Content visibility" : consistency === "Strong" ? "Publishing consistency" : "A clear starting baseline";
  const biggestOpportunity = weakConsistency ? "Publishing consistency" : weakReach ? "Content reach" : "Audience engagement";
  const suggestedGoal = biggestOpportunity === "Content reach" ? "views" : biggestOpportunity === "Audience engagement" ? "engagement" : "followers";
  const recommendations = [
    weakConsistency ? "Create a realistic publishing rhythm you can sustain each month." : "Keep your publishing rhythm consistent and review your strongest formats.",
    weakReach ? "Increase distribution around your strongest-performing content and review view-to-audience trends." : "Repeat the content themes that are earning reliable visibility.",
    weakEngagement ? "Use clearer prompts and content hooks that invite meaningful interaction." : "Protect engagement quality by responding to relevant audience activity.",
  ].slice(0, 3);

  return {
    score,
    engagementRate,
    reachRatio,
    consistency,
    strongestArea,
    biggestOpportunity,
    explanation: `Your score combines engagement, content visibility when supplied, and publishing consistency. ${biggestOpportunity} is the clearest area to improve next.`,
    recommendations,
    suggestedGoal,
  };
}
