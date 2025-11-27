import plugin from 'tailwindcss/plugin';

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
      screens: {
        xs: "360px",
        mobile: "480px",
        "mobile-lg": "560px",
        tablet: "768px",
        laptop: "1024px",
        desktop: "1280px",
      },
      borderRadius: {
        "2.5xl": "1.375rem",
        "fluid": "clamp(0.9rem, 1vw + 0.75rem, 1.5rem)",
      },
      boxShadow: {
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
    },
  },
  plugins: [
    plugin(({ addVariant, addUtilities, theme }) => {
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
