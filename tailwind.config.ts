import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: "#ff6b35",
        "primary-dark": "#e55a2b",
        "primary-light": "#ff8c5a",

        // Background colors
        bg: {
          DEFAULT: "#0d0d0f",
          card: "#1a1a1e",
          elevated: "#242428",
          hover: "#2a2a2e",
        },

        // Border colors
        border: {
          DEFAULT: "#2a2a2e",
          light: "#3a3a3e",
        },

        // Text colors
        text: {
          DEFAULT: "#ffffff",
          secondary: "#a0a0a0",
          muted: "#666666",
        },

        // Status colors
        win: "#22c55e",
        lose: "#ef4444",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
