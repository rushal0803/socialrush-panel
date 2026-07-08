/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
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
