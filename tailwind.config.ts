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
        surface: {
          page: "var(--sr-bg)",
          section: "var(--sr-section)",
          elevated: "var(--sr-bg-elevated)",
          secondary: "var(--sr-bg-secondary)",
          soft: "var(--sr-bg-soft)",
        },
        content: {
          primary: "var(--sr-text-primary)",
          secondary: "var(--sr-text-secondary)",
          muted: "var(--sr-text-muted)",
        },
        action: {
          DEFAULT: "var(--sr-orange)",
          bright: "var(--sr-orange-bright)",
          gold: "var(--sr-gold)",
        },
        state: {
          success: "var(--sr-success)",
          warning: "var(--sr-warning)",
          danger: "var(--sr-error)",
        },
        "sr-border": {
          DEFAULT: "var(--sr-border)",
          strong: "var(--sr-border-strong)",
        },
      },
      borderRadius: {
        "sr-card": "var(--sr-radius-card)",
        "sr-control": "var(--sr-radius-control)",
      },
      boxShadow: {
        soft: "0 18px 42px -22px rgba(0, 0, 0, 0.65)",
        brand: "0 20px 44px -28px rgba(255, 122, 0, 0.55)",
        "sr-card": "var(--sr-shadow-card)",
        "sr-button": "var(--sr-shadow-button)",
        "sr-focus": "var(--sr-focus-ring)",
      },
      maxWidth: {
        "sr-content": "var(--sr-content-width)",
      },
      transitionDuration: {
        fast: "160ms",
        normal: "220ms",
      },
      transitionTimingFunction: {
        "sr-out": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      backgroundImage: {
        "sr-brand": "var(--sr-gradient)",
      },
    },
  },
  plugins: [],
};

export default config;
