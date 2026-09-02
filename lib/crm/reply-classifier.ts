import "server-only";

export type ReplyClassification = "interested"|"needs_information"|"not_now"|"meeting_request"|"positive_reply"|"negative_reply"|"unsubscribe"|"out_of_office"|"bounce"|"wrong_person"|"other";
export type ReplyClassificationResult = { classification: ReplyClassification; confidence: number; reason: string; suggested_next_action: string; needsAdminReview: boolean; source: "rules"|"ai" };

const rule = (classification: ReplyClassification, reason: string, suggested_next_action: string): ReplyClassificationResult => ({ classification, confidence: .99, reason, suggested_next_action, needsAdminReview: false, source: "rules" });
export async function classifyLeadReply(input: { subject?: string|null; bodyText: string }): Promise<ReplyClassificationResult> {
  const text=`${input.subject||""}\n${input.bodyText}`.toLowerCase();
  if (/\b(unsubscribe|remove me|stop emailing|do not contact|take me off (your|the) list)\b/.test(text)) return rule("unsubscribe","Explicit opt-out language detected.","Suppress this address permanently.");
  if (/\b(mailbox unavailable|delivery has failed|undeliverable|recipient address rejected|550 5\.1\.1|user unknown)\b/.test(text)) return rule("bounce","Delivery failure language detected.","Mark the contact invalid and suppress this address.");
  if (/\b(out of (the )?office|automatic reply|away from (my )?(desk|office)|on (annual )?leave)\b/.test(text)) return rule("out_of_office","Out-of-office language detected.","Pause the sequence and review the return date.");
  return { classification:"other", confidence:0, reason:"No configured AI provider; non-obvious replies require an admin decision.", suggested_next_action:"Review and classify this reply.", needsAdminReview:true, source:"rules" };
}

export function safeReplyDraft(classification: ReplyClassification, name?: string|null) {
  const greeting=name ? `Hi ${name},` : "Hello,";
  const drafts: Partial<Record<ReplyClassification,string>> = {
    interested:`${greeting}\n\nThanks for getting back to us. We’d be glad to discuss how SocialRUSH may support your goals. What would be most useful to explore first?`,
    needs_information:`${greeting}\n\nThanks for your reply. We can share information about the SocialRUSH services that are relevant to your goals. Please let us know what you’d like clarified.`,
    meeting_request:`${greeting}\n\nThanks for getting back to us. We’d be happy to arrange a conversation. Please share a few times that work well for you.`,
    not_now:`${greeting}\n\nThanks for letting us know. We understand, and we’ll be happy to reconnect when the timing is better for you.`
  };
  return drafts[classification] || null;
}
