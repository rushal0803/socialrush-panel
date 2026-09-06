import type { SmmService } from "@/lib/smm-service-catalog";

export function linkedInUsaEndorsementsFaqs(service: SmmService) {
  return [
    ["What are LinkedIn USA Endorsements?", "This USA-targeted service applies endorsement activity to one exact skill on an eligible public LinkedIn personal profile."],
    ["Which LinkedIn URL should I submit?", "Submit a public personal profile URL in the linkedin.com/in/... format. Post, company-page and group URLs are not eligible."],
    ["Which skill receives endorsements?", "Enter the exact skill name from the Skills section of the submitted profile. The skill name is collected before secure checkout."],
    ["What are the quantity limits?", `The active catalog limit is ${service.minQuantity.toLocaleString("en-IN")} to ${service.maxQuantity.toLocaleString("en-IN")} endorsements per order.`],
    ["How much does it cost?", "The order builder displays the active rate per 1,000 and calculates the total for the selected quantity before you continue."],
    ["How long does delivery take?", `The current catalog delivery estimate is ${service.deliveryTime}.`],
    ["Is refill or support included?", `The active catalog lists ${service.refillPolicy}. Review the current order summary before continuing.`],
    ["Do I need to provide LinkedIn credentials?", "No. SocialRUSH never asks for your LinkedIn password, email password, OTP, or recovery code."],
    ["Can I track my order?", "Yes. Continue through secure checkout and track the order in your SocialRUSH dashboard."],
    ["Are endorsements the same as followers or connections?", "No. This service is for a selected profile skill. Followers and connections are distinct LinkedIn services."],
    ["Do endorsements guarantee jobs, leads, reach, or sales?", "No. SocialRUSH does not guarantee jobs, recruiter outcomes, reach, leads, clients, sales, rankings, or other commercial outcomes."],
  ] as const;
}
