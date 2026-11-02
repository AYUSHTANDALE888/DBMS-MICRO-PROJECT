/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#004ac6",
          container: "#2563eb",
          dark: "#1d4ed8",
          light: "#dbe1ff"
        },
        surface: {
          DEFAULT: "#f8f9ff",
          dim: "#cbdbf5",
          bright: "#f8f9ff",
          container: "#e5eeff",
          "container-low": "#eff4ff",
          "container-lowest": "#ffffff",
          "container-high": "#dce9ff",
          "container-highest": "#d3e4fe",
        },
        tertiary: {
          DEFAULT: "#006058",
          container: "#007b71",
          light: "#89f5e7"
        },
        outline: {
          DEFAULT: "#737686",
          variant: "#e2e8f0", // Clean subtle slate-200 border
        },
        "on-surface": {
          DEFAULT: "#0f172a",
          variant: "#475569"
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

