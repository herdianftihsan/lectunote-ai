import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#1565C0",
          hover: "#0D47A1",
          dark: "#0D47A1",
          light: "#E3F2FD",
        },
        teal: {
          DEFAULT: "#007887",
          light: "#ECFEFF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          main: "#F8FAFC",
          white: "#FFFFFF",
          border: "#E2E8F0",
        },
        background: "#F8FAFC",
        border: "#E2E8F0",
        text: {
          main: "#0F172A",
          secondary: "#64748B",
          muted: "#94A3B8",
        },
        status: {
          success: "#15803D",
          warning: "#92400E",
          danger: "#DC2626",
        },
        success: {
          DEFAULT: "#15803D",
          light: "#F0FDF4",
        },
        warning: {
          DEFAULT: "#92400E",
          text: "#92400E",
          bg: "#FFFBEB",
          border: "#FDE68A",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
