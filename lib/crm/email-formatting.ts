import type { CRMLead, CRMLeadContact } from "./types";

type Personalization = Pick<CRMLead, "business_name" | "recommended_service"> & Pick<CRMLeadContact, "full_name">;
const signature = ["Thanks,", "SocialRUSH Team", "Social Media Growth Solutions", "getsocialrush.com"];
const placeholder = /{{\s*(first_name|business_name|recommended_service)\s*}}/gi;

function firstName(fullName: string | null | undefined) { return fullName?.trim().split(/\s+/)[0] || ""; }

/** Converts only single literal escaped CR/LF sequences; double-escaped text remains literal. */
export function normalizeEscapedLineBreaks(value: string | null | undefined) {
  const input = value || ""; let output = "";
  for (let index = 0; index < input.length; index += 1) {
    if (input[index] === "\\" && input[index + 1] === "\\") { output += "\\\\"; index += 1; }
    else if (input[index] === "\\" && input[index + 1] === "n") { output += "\n"; index += 1; }
    else if (input[index] === "\\" && input[index + 1] === "r" && input[index + 2] === "\\" && input[index + 3] === "n") { output += "\n"; index += 3; }
    else output += input[index];
  }
  return output.replace(/\r\n?/g, "\n");
}

function renderLine(line: string, values: Record<string, string>) {
  const unresolved: string[] = [];
  const rendered = line.replace(placeholder, (_match, key: string) => { const value = values[key.toLowerCase()] || ""; if (!value) unresolved.push(key); return value; });
  if (!unresolved.length) return rendered.replace(/[ \t]{2,}/g, " ").trimEnd();
  if (/^\s*(hi|hello|dear)\b/i.test(line)) return rendered.replace(/\s+,/g, ",").replace(/[ \t]{2,}/g, " ").trimEnd();
  return "";
}

export function renderOutreachText(template: string | null | undefined, personalization: Personalization) {
  const values = { first_name: firstName(personalization.full_name), business_name: personalization.business_name?.trim() || "", recommended_service: personalization.recommended_service?.trim() || "" };
  const body = normalizeEscapedLineBreaks(template).split("\n").map((line) => renderLine(line, values)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const alreadySigned = /(?:^|\n)(?:thanks|best regards|kind regards),?\s*\n[\s\S]{0,120}socialrush/i.test(body);
  return [...(body ? [body] : []), ...(alreadySigned ? [] : [signature.join("\n")])].join("\n\n");
}

export function renderOutreachSubject(template: string | null | undefined, personalization: Personalization) {
  const values = { first_name: firstName(personalization.full_name), business_name: personalization.business_name?.trim() || "", recommended_service: personalization.recommended_service?.trim() || "" };
  return normalizeEscapedLineBreaks(template).split("\n").map((line) => renderLine(line, values)).join(" ").replace(/\s+/g, " ").trim();
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
export function outreachTextToHtml(text: string) {
  const paragraphs = text.split(/\n{2,}/).map((paragraph) => `<p style="margin:0 0 18px;">${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`).join("");
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body style="margin:0;background:#ffffff;color:#1f2937;font-family:Arial,Helvetica,sans-serif;"><main style="max-width:600px;margin:0 auto;padding:28px 20px;font-size:16px;line-height:1.6;">${paragraphs}</main></body></html>`;
}
export function formatOutreachEmail(template: string | null | undefined, personalization: Personalization) { const text = renderOutreachText(template, personalization); return { text, html: outreachTextToHtml(text) }; }
