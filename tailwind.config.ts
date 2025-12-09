import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Brand Colors
        brand: {
          navy: "#1e3a5f",
          "navy-light": "#2a4a73",
          "navy-dark": "#152a45",
          red: "#e63946",
          "red-light": "#eb5461",
          "red-dark": "#c42d39",
          white: "#ffffff",
          gray: "#f5f7fa",
        },
        // Semantic colors using brand
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1e3a5f",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f5f7fa",
          foreground: "#1e3a5f",
        },
        destructive: {
          DEFAULT: "#e63946",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f5f7fa",
          foreground: "#5a6b7d",
        },
        accent: {
          DEFAULT: "#e63946",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#1e3a5f",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1e3a5f",
        },
        emergency: {
          DEFAULT: "#e63946",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#22c55e",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        "3d": "4px 4px 0 0 #1e3a5f",
        "3d-sm": "2px 2px 0 0 #1e3a5f",
        "3d-hover": "2px 2px 0 0 #1e3a5f",
        "3d-white": "4px 4px 0 0 #ffffff",
        "3d-white-sm": "2px 2px 0 0 #ffffff",
      },
      fontFamily: {
        sans: [
          "Space Grotesk",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
        mono: [
          "Space Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
