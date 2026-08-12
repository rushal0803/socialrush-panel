/** @type {import('next').NextConfig} */
const scriptSource = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === "development" ? ["'unsafe-eval'"] : []),
  "https://sdk.cashfree.com",
].join(" ");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            // Next.js and payment SDKs require inline bootstrap scripts; this still
            // blocks plugin content, framing, and unexpected base URL changes.
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src ${scriptSource}; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://open.er-api.com https://sandbox.cashfree.com https://api.cashfree.com https://sdk.cashfree.com; frame-src 'self' https://sandbox.cashfree.com https://api.cashfree.com; img-src 'self' data: blob: https:; font-src 'self' data: https:; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self' https://sandbox.cashfree.com https://api.cashfree.com; upgrade-insecure-requests`,
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/register",
        permanent: true,
      },
      {
        source: "/buy-instagram-followers",
        destination: "/buy-instagram-followers-india",
        permanent: true,
      },
      {
        source: "/blog/linkedin-growth-tips-for-personal-brands",
        destination: "/blog/linkedin-growth-tips-personal-brands",
        permanent: true,
      },
      {
        source: "/blog/how-to-grow-fast-on-instagram-without-looking-fake",
        destination: "/blog/how-to-grow-fast-on-instagram",
        permanent: true,
      },
      {
        source: "/blog/best-way-to-grow-linkedin-followers-for-business",
        destination: "/blog/linkedin-followers-for-business-growth",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "getsocialrush.com" }],
        destination: "https://www.getsocialrush.com/:path*",
        permanent: true,
      },
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
