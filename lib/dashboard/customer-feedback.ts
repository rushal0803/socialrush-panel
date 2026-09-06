/**
 * Customer-facing errors must remain useful without exposing provider,
 * database, or authentication implementation details.
 */
export function customerFeedbackError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message.trim();
    // These are safe, actionable messages emitted by client-side validation.
    if (/^(password must|passwords do not match|please enter|invalid email)/i.test(message)) return message;
  }
  return fallback;
}
