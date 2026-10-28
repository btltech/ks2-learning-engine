import plugin from 'tailwindcss/plugin';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.{js,ts,jsx,tsx}",
    "./App.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}",
    "./constants.{js,ts,jsx,tsx}",
    "./types.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
      },
    },
    extend: {
      colors: {
        ink: '#172033', muted: '#4A5568',
        gold: { DEFAULT: '#FFC93C', deep: '#F2A91C' },
        sky: { ...colors.sky, DEFAULT: '#3D8BFF' }, bubblegum: '#FF6FB5', leaf: '#2FC27A',
        grape: '#8E6CFF', orange: { ...colors.orange, DEFAULT: '#FF9F1C' }, coral: '#FF5A4E',
        action: '#1E55C8', page: '#FFF9EC',
        tint: {
          sky: '#DCEBFF', grape: '#ECE6FF', leaf: '#DDF6E8', gold: '#FFF1C7',
          orange: '#FFE9D2', bubblegum: '#FFE3F1', teal: '#D7F3EF', coral: '#FFE1DE',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'sans-serif'],
        body: ['Atkinson Hyperlegible', 'sans-serif'],
      },
      borderWidth: { 3: '3px' },
      outlineWidth: { 3: '3px', 4: '4px' },
      outlineColor: { ink: '#172033', action: '#1E55C8' },
      backgroundImage: { 'sunny-dots': 'radial-gradient(#F3E3B8 2px, transparent 2px)' },
      backgroundSize: { 'sunny-grid': '28px 28px' },
      screens: {
        xs: "360px",
        mobile: "480px",
        "mobile-lg": "560px",
        tablet: "768px",
        laptop: "1024px",
        desktop: "1280px",
      },
      borderRadius: {
        'kid-button': '18px', 'kid-card': '28px', 'kid-hero': '32px', 'kid-chip': '999px',
        "2.5xl": "1.375rem",
        "fluid": "clamp(0.9rem, 1vw + 0.75rem, 1.5rem)",
      },
      boxShadow: {
        chunky: '0 5px 0 #172033',
        'chunky-card': '0 6px 0 #172033',
        'chunky-hover': '0 3px 0 #172033',
        lifted: "0 12px 45px rgba(15, 23, 42, 0.12)",
        subtle: "0 8px 24px rgba(15, 23, 42, 0.06)",
      },
      spacing: {
        18: "4.5rem",
        "safe": "env(safe-area-inset-bottom)",
      },
      maxWidth: {
        "screen-content": "1200px",
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'fadeInUp': 'fadeInUp 0.4s ease-out',
        'fadeInDown': 'fadeInDown 0.4s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite', // Fix #6: Better loading states
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: { // Fix #6: Shimmer animation for loading states
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    plugin(({ addVariant, addUtilities, theme }) => {
      // Fix #5: Reduced motion support
      addVariant("motion-safe", "@media (prefers-reduced-motion: no-preference)");
      addVariant("motion-reduce", "@media (prefers-reduced-motion: reduce)");
      
      addVariant("touch", "@media (pointer: coarse)");
      addVariant("notouch", "@media (pointer: fine)");
      addVariant("mobile-only", "@media (max-width: 767px)");

      addUtilities(
        {
          ".touch-target": {
            minHeight: "44px",
            minWidth: "44px",
            padding: `${theme("spacing.2")} ${theme("spacing.3")}`,
            borderRadius: theme("borderRadius.lg"),
          },
          ".safe-top": {
            paddingTop: "env(safe-area-inset-top)",
          },
          ".safe-bottom": {
            paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
          },
          ".touch-scroll": {
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
            overscrollBehaviorY: "contain",
          },
          ".content-visibility-auto": {
            contentVisibility: "auto",
            containIntrinsicSize: "1px 500px",
          },
        },
        ["responsive", "touch"]
      );
    }),
  ],
};
