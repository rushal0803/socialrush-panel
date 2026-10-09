import "server-only";

export type ReplyClassification = "interested"|"needs_information"|"not_now"|"meeting_request"|"positive_reply"|"negative_reply"|"unsubscribe"|"out_of_office"|"bounce"|"wrong_person"|"other";
export type ReplyClassificationResult = { classification: ReplyClassification; confidence: number; reason: string; suggested_next_action: string; needsAdminReview: boolean; source: "rules"|"ai" };

const rule = (classification: ReplyClassification, reason: string, suggested_next_action: string): ReplyClassificationResult => ({ classification, confidence: .99, reason, suggested_next_action, needsAdminReview: false, source: "rules" });

/**
 * Returns only the reply newly authored by the sender. The original message is
 * deliberately retained by ingestion; this value is used solely for rules so
 * that an outbound call-to-action cannot classify a reply by accident.
 */
export function extractLatestReplyText(bodyText: string): string {
  const lines = bodyText.replace(/\r\n?/g, "\n").split("\n");
  const latest: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    const nextLines = lines.slice(index, index + 4).map((value) => value.trim());
    const isGmailQuote = /^on .+wrote:\s*$/i.test(trimmed);
    const isQuotedLine = /^>/.test(trimmed);
    const isForwardedSeparator = /^(?:-+\s*(?:original|forwarded) message\s*-+|begin forwarded message:?)$/i.test(trimmed);
    const isHeaderBlock = /^(?:from|sent|to|subject):/i.test(trimmed)
      && nextLines.filter((value) => /^(?:from|sent|to|subject):/i.test(value)).length >= 2;

    if (isGmailQuote || isQuotedLine || isForwardedSeparator || isHeaderBlock) break;
    latest.push(line);
  }

  return latest.join("\n").trim();
}

export async function classifyLeadReply(input: { subject?: string|null; bodyText: string }): Promise<ReplyClassificationResult> {
  const text=extractLatestReplyText(input.bodyText).toLowerCase().replace(/[\u2018\u2019]/g, "'");
  if (/\b(unsubscribe|remove me|stop emailing|do not contact|take me off (your|the) list)\b/.test(text)) return rule("unsubscribe","Explicit opt-out language detected.","Suppress this address permanently.");
  if (/\b(mailbox unavailable|delivery has failed|undeliverable|recipient address rejected|550 5\.1\.1|user unknown)\b/.test(text)) return rule("bounce","Delivery failure language detected.","Mark the contact invalid and suppress this address.");
  if (/\b(out of (the )?office|automatic reply|away from (my )?(desk|office)|on (annual )?leave)\b/.test(text)) return rule("out_of_office","Out-of-office language detected.","Pause the sequence and review the return date.");
  // Keep explicit rejection ahead of positive language (for example, "not interested").
  if (/\b(not interested|no thanks|not a fit|we (?:do not|don't) need this)\b/.test(text)) return rule("negative_reply","Explicit negative response detected.","Mark the lead as lost.");
  if (/\b(not right now|maybe later|reach out later|circle back (?:next month|later)|maybe next month)\b/.test(text)) return rule("not_now","Prospect asked to reconnect later.","Mark the lead as replied and revisit at the requested time.");
  if (/\b(wrong person|wrong contact|you have the wrong (?:person|contact)|please contact someone else)\b/.test(text)) return rule("wrong_person","Sender identified an incorrect contact.","Review the contact and find the appropriate person.");
  if (/\b(let'?s schedule (?:a )?call|can we (?:talk|schedule a call)|book (?:a )?meeting|when are you available)\b/.test(text)) return rule("meeting_request","Prospect requested a conversation.","Qualify the lead and create a reply follow-up.");
  if (/\b(send (?:me )?(?:more )?(?:details|pricing|information)|what(?:'s| is) the price|how does it work|tell me more|more information)\b/.test(text)) return rule("needs_information","Prospect requested more information.","Mark the lead as replied and create a reply follow-up.");
  if (/\b(i(?:'m| am) interested|yes,? (?:i(?:'m| am) )?interested|sounds good|yes please|i'd like to know more|let'?s discuss)\b/.test(text)) return rule("interested","Positive interest language detected.","Qualify the lead and create a reply follow-up.");
  return { classification:"other", confidence:0, reason:"No configured AI provider; non-obvious replies require an admin decision.", suggested_next_action:"Review and classify this reply.", needsAdminReview:true, source:"rules" };
}

export function safeReplyDraft(classification: ReplyClassification, name?: string|null, context?: { businessName?: string|null; recommendedService?: string|null }) {
  const greeting=name ? `Hi ${name},` : "Hello,";
  const service=context?.recommendedService?.trim();
  const business=context?.businessName?.trim();
  const fit=service ? ` around ${service}` : "";
  const company=business ? ` for ${business}` : "";
  const drafts: Partial<Record<ReplyClassification,string>> = {
    interested:`${greeting}\n\nThanks for getting back to us. We’d be glad to explore how SocialRUSH can support your growth${fit}${company}. If you share your main goal and the platform you want to prioritize, we can suggest the most suitable starting option.`,
    needs_information:`${greeting}\n\nThanks for your reply. Happy to share more details${fit}. Tell us what you’d like to know—pricing, delivery, recommended quantity, or how the service works—and we’ll keep the answer specific to your goal.`,
    meeting_request:`${greeting}\n\nThanks for getting back to us. We’d be happy to discuss your growth goals${company}. Please share a few times that work well for you, and we’ll coordinate the next step.`,
    not_now:`${greeting}\n\nThanks for letting us know. No problem—we’ll pause here. When the timing is better, you can reply to this email and we’ll pick the conversation back up.`
  };
  return drafts[classification] || null;
}
