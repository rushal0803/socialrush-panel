import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#FFFFFF",
        brand: {
          navy: "#0B0B0F",
          card: "#111111",
          soft: "#D1D5DB",
          electric: "#FF9F00",
          accent: "#FFC400",
          deep: "#050505",
        },
        rush: {
          50: "#FFF8F1",
          100: "#FFF3E0",
          500: "#FF9F00",
          600: "#FF7A00",
          700: "#D95F00",
        },
      },
      boxShadow: {
        soft: "0 18px 42px -22px rgba(0, 0, 0, 0.65)",
        brand: "0 20px 44px -28px rgba(255, 122, 0, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
