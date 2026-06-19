/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF",
        "primary-dark": "#1E3A8A",
        secondary: "#3B82F6",
        accent: "#D97706",
        muted: "#E9EEF6",
        border: "#DBEAFE",
        destructive: "#DC2626",
        sidebar: "#0F172A",
        "sidebar-active": "#1E3A8A",
        "app-bg": "#F8FAFC",
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

