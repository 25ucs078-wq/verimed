/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          start: "#070A18",
          mid: "#10132B",
          end: "#0A0E24"
        },
        brand: {
          teal: "#2DE0C2",
          red: "#FF5577",
          amber: "#FFB648",
          violet: "#8B7BFF"
        },
        glass: {
          border: "rgba(255, 255, 255, 0.12)",
          bg: "rgba(16, 19, 43, 0.45)",
          highlight: "rgba(255, 255, 255, 0.08)"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"]
      }
    },
  },
  plugins: [],
}
