/** @type {import('next').NextConfig} */
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
