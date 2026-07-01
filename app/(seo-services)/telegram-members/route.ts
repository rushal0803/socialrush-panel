export function GET(request: Request) {
  return Response.redirect(new URL("/buy-telegram-members-india", request.url), 301);
}
