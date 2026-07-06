const canonicalServiceRedirects = {
  "/buy-instagram-followers-india": "/buy-instagram-followers",
  "/buy-instagram-likes-india": "/instagram-likes",
  "/buy-instagram-views-india": "/instagram-views",
  "/buy-youtube-subscribers-india": "/youtube-subscribers",
  "/buy-youtube-likes-india": "/youtube-likes",
  "/buy-youtube-views-india": "/youtube-views",
  "/buy-linkedin-followers-india": "/linkedin-followers",
  "/buy-linkedin-likes-india": "/linkedin-likes",
  "/buy-twitter-followers-india": "/twitter-followers",
  "/buy-facebook-followers-india": "/facebook-followers",
  "/buy-facebook-likes-india": "/facebook-likes",
  "/buy-telegram-members-india": "/telegram-members",
  "/buy-tiktok-followers-india": "/tiktok-followers",
  "/services/instagram-audience-growth": "/buy-instagram-followers",
  "/services/instagram-engagement-boost": "/instagram-likes",
  "/services/instagram-content-reach": "/instagram-views",
  "/services/youtube-channel-growth": "/youtube-subscribers",
  "/services/youtube-video-promotion": "/youtube-views",
  "/services/facebook-brand-engagement": "/facebook-likes",
  "/services/linkedin-professional-growth": "/linkedin-followers",
  "/services/x-authority-growth": "/twitter-followers",
  "/services/instagram-followers": "/buy-instagram-followers",
  "/services/instagram-likes": "/instagram-likes",
  "/services/instagram-views": "/instagram-views",
  "/services/youtube-subscribers": "/youtube-subscribers",
  "/services/youtube-likes": "/youtube-likes",
  "/services/youtube-views": "/youtube-views",
  "/services/linkedin-followers": "/linkedin-followers",
  "/services/linkedin-likes": "/linkedin-likes",
  "/services/facebook-followers": "/facebook-followers",
  "/services/facebook-likes": "/facebook-likes",
  "/services/telegram-members": "/telegram-members",
  "/services/tiktok-followers": "/tiktok-followers",
  "/services/x-followers": "/twitter-followers",
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "getsocialrush.com" }],
        destination: "https://www.getsocialrush.com/:path*",
        permanent: true,
      },
      ...Object.entries(canonicalServiceRedirects).map(
        ([source, destination]) => ({
          source,
          destination,
          permanent: true,
        }),
      ),
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "react-icons"],
  },
};

export default nextConfig;
