import type { Config } from "tailwindcss";

export default {
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
        // Zine brand colors
        zine: {
          green: "#1BEA2D",
          yellow: "#FFF967", 
          blue: "#9ED1FF",
          darkblue: "#2326D0"
        }
      },
      animation: {
        'marquee': 'marquee-left 40s linear infinite',
        'marquee-slow': 'marquee-left 60s linear infinite',
        'marquee-fast': 'marquee-left 20s linear infinite',
      },
      keyframes: {
        'marquee-left': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
