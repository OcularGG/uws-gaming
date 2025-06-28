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
        
        // New color palette
        'primary': "var(--primary)",
        'primary-hover': "var(--primary-hover)",
        'primary-light': "var(--primary-light)",
        'primary-dark': "var(--primary-dark)",
        'secondary': "var(--secondary)",
        'secondary-hover': "var(--secondary-hover)",
        'secondary-light': "var(--secondary-light)",
        
        // Accent colors
        'accent-primary': "var(--accent-primary)",
        'accent-light': "var(--accent-light)",
        'accent-warm': "var(--accent-warm)",
        'accent-mid': "var(--accent-mid)",
        'accent-tan': "var(--accent-tan)",
        'accent-beige': "var(--accent-beige)",
        'accent-cream': "var(--accent-cream)",
        
        // Muted colors
        'muted-primary': "var(--muted-primary)",
        'muted-dark': "var(--muted-dark)",
        'muted-brown': "var(--muted-brown)",
        'muted-charcoal': "var(--muted-charcoal)",
        
        // Light colors
        'light-white': "var(--light-white)",
        'light-cream': "var(--light-cream)",
        'light-beige': "var(--light-beige)",
        'light-tan': "var(--light-tan)",
        'light-warm': "var(--light-warm)",
        'light-gold': "var(--light-gold)",
        'light-bronze': "var(--light-bronze)",
        'light-copper': "var(--light-copper)",
        'light-rust': "var(--light-rust)",
        'light-earth': "var(--light-earth)",
        'light-sienna': "var(--light-sienna)",
        
        // Dark colors
        'dark-black': "var(--dark-black)",
        'dark-charcoal': "var(--dark-charcoal)",
        'dark-brown': "var(--dark-brown)",
        'dark-umber': "var(--dark-umber)",
        'dark-earth': "var(--dark-earth)",
        'dark-bronze': "var(--dark-bronze)",
        'dark-copper': "var(--dark-copper)",
        'dark-rust': "var(--dark-rust)",
        'dark-sienna': "var(--dark-sienna)",
        'dark-gold': "var(--dark-gold)",
        'dark-tan': "var(--dark-tan)",
        
        // Legacy mappings (updated)
        'navy-dark': "var(--navy-dark)",
        'navy-blue': "var(--navy-blue)",
        'navy-light': "var(--navy-light)",
        'brass': "var(--brass)",
        'brass-bright': "var(--brass-bright)",
        'sail-white': "var(--sail-white)",
        'sandstone-light': "var(--sandstone-light)",
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'crimson': ['Crimson Text', 'serif'],
        'cedarville': ['Cedarville Cursive', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;
