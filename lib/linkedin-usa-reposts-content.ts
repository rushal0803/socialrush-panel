import type { SmmService } from "@/lib/smm-service-catalog";

/** Shared by the server schema and the interactive landing page. */
export function linkedInUsaRepostsFaqs(service: SmmService) {
  return [
    ["What are LinkedIn USA Reposts?", "This service is for repost activity on one eligible public LinkedIn post using the USA-targeted catalog option."],
    ["How do I buy LinkedIn USA Reposts?", "Choose a quantity, add the exact public LinkedIn post URL, review the current total and continue to the secure order flow."],
    ["Which LinkedIn URL should I submit?", "Submit the exact public post URL in linkedin.com/posts/... or linkedin.com/feed/update/... format. Profile, company, group and external URLs are not eligible."],
    ["Does the post need to be public?", "Yes. Keep the submitted post publicly accessible while the order is processing."],
    ["Can I submit my profile URL?", "No. This service applies to a submitted post, not a profile, company page or LinkedIn Group."],
    ["What are the quantity limits?", `The current catalog limit is ${service.minQuantity.toLocaleString("en-IN")} to ${service.maxQuantity.toLocaleString("en-IN")} reposts per order.`],
    ["How much does it cost?", "The order builder shows the active catalog rate per 1,000 and calculates the total for the quantity you select before checkout."],
    ["How long does delivery take?", `The current catalog delivery estimate is ${service.deliveryTime}. Timing can vary with quantity and post availability.`],
    ["Is refill or support included?", `The active catalog lists ${service.refillPolicy}. Review the current service details in the order summary before continuing.`],
    ["Do I need to provide my LinkedIn password?", "No. SocialRUSH never asks for your LinkedIn password, email password, OTP or recovery code."],
    ["Can I track the order?", "Yes. Continue through secure checkout, then track order progress from your SocialRUSH dashboard."],
    ["Are reposts different from likes or comments?", "Yes. Reposts relate to the repost/share action on a submitted post. Likes and custom comments are separate post-level services."],
    ["Do reposts guarantee reach, leads or sales?", "No. SocialRUSH does not guarantee reach, impressions, leads, clients, sales or other commercial outcomes."],
  ] as const;
}
