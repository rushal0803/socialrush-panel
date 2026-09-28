export const smmApiIndiaKeywords = [
  "social media API India",
  "social media growth API India",
  "agency social media API India",
  "social media API for agencies India",
  "campaign management API India",
] as const;

export const smmApiCriteria = [
  {
    id: "auth",
    title: "Account-scoped API key",
    text: "Authenticated users can generate an API key and send it as a Bearer token. Keys should stay server-side and must not be exposed in public browser code or repositories.",
  },
  {
    id: "create",
    title: "Create campaign orders",
    text: "The documented order endpoint accepts a service identifier, public destination link and quantity, then returns the normal API response for the submitted request.",
  },
  {
    id: "status",
    title: "Retrieve order status",
    text: "API clients can request the current status and fulfillment details for an order ID instead of relying on manual status checks.",
  },
  {
    id: "limits",
    title: "Published request limit",
    text: "The signed-in API documentation currently lists a limit of up to 120 requests per minute and describes rate-limit response headers.",
  },
] as const;

export function smmApiFaqs() {
  return [
    {
      question: "Does SocialRUSH provide a social media growth API in India?",
      answer:
        "SocialRUSH provides authenticated API access for connected workflows. Signed-in users can generate an account-scoped API key, create eligible orders through the documented API and retrieve order status. Current API documentation remains authoritative.",
    },
    {
      question: "Can an agency automate SocialRUSH orders with the API?",
      answer:
        "The current API documentation includes authenticated order creation and order-status retrieval. Agencies should review the signed-in documentation, current service identifiers, limits and validation rules before integrating an automated workflow.",
    },
    {
      question: "Does the SocialRUSH API create a separate white-label platform?",
      answer:
        "No separate white-label platform is promised. API access is a developer workflow for an authenticated SocialRUSH account and does not by itself create a separate branded product.",
    },
  ] as const;
}
