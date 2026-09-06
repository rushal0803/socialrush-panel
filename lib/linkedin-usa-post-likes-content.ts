import type { SmmService } from "@/lib/smm-service-catalog";

export function linkedInUsaPostLikesFaqs(service: SmmService) {
  return [
    ["What are LinkedIn USA Post Likes?", "This service is for visible like activity on an eligible public LinkedIn post using the USA-targeted catalog option."],
    ["Which LinkedIn URL should I provide?", "Provide the exact public post URL. Eligible formats include linkedin.com/posts/... and linkedin.com/feed/update/.... Profile, company-page, group and unrelated URLs are not eligible."],
    ["Does my LinkedIn post need to be public?", "Yes. Submit the exact public LinkedIn post URL and keep the post accessible while the order is processing."],
    ["Do I need to provide my LinkedIn password?", "No. SocialRUSH never asks for your LinkedIn password, email password, OTP or recovery code."],
    ["What are the quantity limits?", `The current catalog limit is ${service.minQuantity.toLocaleString("en-IN")} to ${service.maxQuantity.toLocaleString("en-IN")} likes per order.`],
    ["How much does the service cost?", "The order builder shows the active catalog rate per 1,000 and calculates the total for the selected quantity before secure checkout."],
    ["How long does delivery take?", `The current catalog delivery estimate is ${service.deliveryTime}. Timing can vary with quantity and post availability.`],
    ["Is refill or support included?", `The active catalog lists ${service.refillPolicy}. Review the current service details in the order summary before continuing.`],
    ["Can I track my order?", "Yes. Continue through secure checkout, then track the order from your SocialRUSH dashboard."],
    ["Are post likes different from LinkedIn Followers?", "Yes. This service applies to one submitted public post. Followers are a separate, follower-focused service for eligible LinkedIn profiles."],
    ["Do post likes guarantee reach, leads or sales?", "No. SocialRUSH does not guarantee reach, impressions, leads, clients, jobs, sales or other commercial outcomes."],
  ] as const;
}
