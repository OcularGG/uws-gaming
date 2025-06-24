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
        background: "var(--background)",
        foreground: "var(--foreground)",
        'navy-dark': "var(--navy-dark)",
        'navy-blue': "var(--navy-blue)",
        'navy-light': "var(--navy-light)",
        'brass': "var(--brass)",
        'brass-bright': "var(--brass-bright)",
        'brass-dark': "var(--dark-gold-dark)",
        'bronze': "var(--bronze)",
        'rope': "var(--rope)",
        'sail-white': "var(--sail-white)",
        'wood-dark': "var(--wood-dark)",
        'wood-light': "var(--wood-light)",
        'cannon-smoke': "var(--cannon-smoke)",
        'blood-red': "var(--blood-red)",
        'ocean-foam': "var(--ocean-foam)",
        'sandstone-light': "var(--sandstone-500)",
        'sandstone': {
          100: "var(--sandstone-100)",
          200: "var(--sandstone-200)",
          300: "var(--sandstone-300)",
          400: "var(--sandstone-400)",
          500: "var(--sandstone-500)",
          600: "var(--sandstone-600)",
          700: "var(--sandstone-700)",
          800: "var(--sandstone-800)",
        },
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'crimson': ['Crimson Text', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
