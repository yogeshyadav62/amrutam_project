/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        amrutam: {
          blue: '#3B82F6',
          green: '#10B981',
          purple: '#8B5CF6',
          yellow: '#F59E0B',
          darkBg: '#0F172A',
          darkCard: '#1E293B',
          darkBorder: '#334155',
        },
      },
    },
  },
  plugins: [],
};
