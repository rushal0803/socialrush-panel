export function GET(request: Request) {
  return Response.redirect(
    new URL("/buy-tiktok-followers-india", request.url),
    301,
  );
}
