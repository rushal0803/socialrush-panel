import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        brand: {
          navy: "#07152f",
          card: "#0b1628",
          soft: "#e2e8f0",
          electric: "#38bdf8",
          accent: "#2dd4bf",
          deep: "#020617",
        },
        rush: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      boxShadow: {
        soft: "0 18px 50px -18px rgba(16, 24, 40, 0.18)",
        brand: "0 25px 60px -30px rgba(37, 99, 235, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
