import type { SmmService } from "@/lib/smm-service-catalog";

export function linkedInUsaCustomCommentsFaqs(service: SmmService) {
  return [
    ["What are LinkedIn USA Custom Comments?", "This service places customer-provided comment text on one submitted eligible public LinkedIn post using the USA-targeted catalog option."],
    ["Which LinkedIn URL should I submit?", "Submit the exact public post URL in linkedin.com/posts/... or linkedin.com/feed/update/... format. Profile, company-page, group and unrelated URLs are not eligible."],
    ["Can I submit my profile URL?", "No. This service applies to a submitted LinkedIn post, not a personal profile, company page, or group."],
    ["Does the post need to be public?", "Yes. Keep the submitted LinkedIn post public and accessible while the order is processing."],
    ["How do I provide custom comment text?", "Enter one custom comment on each line. The number of nonblank comment lines must exactly match the quantity in your order."],
    ["Can I choose exactly what each comment says?", "You provide the comment text. Review each line before continuing, because each valid line is treated as one comment for the submitted post."],
    ["What are the quantity limits?", `The current catalog limit is ${service.minQuantity.toLocaleString("en-IN")} to ${service.maxQuantity.toLocaleString("en-IN")} comments per order.`],
    ["How much does the service cost?", "The order builder shows the active catalog rate per 1,000 and calculates the total for your selected quantity before secure checkout."],
    ["How long does delivery take?", `The current catalog delivery estimate is ${service.deliveryTime}. Timing can vary with quantity and post availability.`],
    ["Is refill or support included?", `The active catalog lists ${service.refillPolicy}. Review the current service details in the order summary before continuing.`],
    ["Do I need to provide my LinkedIn password?", "No. SocialRUSH never asks for your LinkedIn password, email password, OTP, or recovery code."],
    ["Can I track my order?", "Yes. Continue through secure checkout, then track the order from your SocialRUSH dashboard."],
    ["Are custom comments different from LinkedIn post likes?", "Yes. Custom Comments use the text you supply for one submitted post. Post Likes are a separate service for like activity on a submitted eligible public post."],
    ["Do custom comments guarantee reach, leads, or sales?", "No. SocialRUSH does not guarantee reach, impressions, replies, leads, sales, ranking, or other commercial outcomes."],
  ] as const;
}
