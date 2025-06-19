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
      },
    },
    keyframes: {
      ring: {
        '0%': { transform: 'scale(1) rotate(0deg)' },
        '15%': { transform: 'scale(1.05) rotate(3deg)' },
        '30%': { transform: 'scale(1) rotate(-2deg)' },
        '45%': { transform: 'scale(1.03) rotate(1deg)' },
        '60%': { transform: 'scale(1) rotate(0deg)' },
        '100%': { transform: 'scale(1)' },
      },
    },
    animation: {
      ring: 'ring 0.6s ease-in-out',
    },
  },
  plugins: [],
} satisfies Config;
