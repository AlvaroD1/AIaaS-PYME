/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F766E",
        "primary-dark": "#0F172A",
        secondary: "#14B8A6",
        accent: "#D97706",
        muted: "#F1F5F9",
        border: "#E2E8F0",
        destructive: "#DC2626",
        sidebar: "#0F172A",
        "sidebar-active": "#0F766E",
        "app-bg": "#FAFAFA",
        "onboard-bg": "#020617",
        "onboard-green": "#22C55E",
      },
      fontFamily: {
        heading: ["Fira Code", "monospace"],
        body: ["Fira Sans", "sans-serif"],
        onboard: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

