import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // surfaces (light mode primary)
        bg: "#f8fafc",         // slate-50 — page bg
        surface: "#ffffff",    // cards
        border: "#e2e8f0",     // slate-200
        borderStrong: "#cbd5e1", // slate-300
        text: "#0f172a",       // slate-900
        muted: "#64748b",      // slate-500
        subtle: "#94a3b8",     // slate-400

        // dark sidebar (Linear/Vercel vibe)
        sidebar: "#0b1220",
        sidebar2: "#111c2f",
        sidebarHover: "#1a2540",
        sidebarText: "#cbd5e1",
        sidebarTextStrong: "#f8fafc",
        sidebarMuted: "#64748b",

        // primary — fresh medical teal (Apple Health-ish, not the old forest)
        primary: "#14b8a6",
        primaryHover: "#0d9488",
        primarySoft: "#f0fdfa",
        primarySoftStrong: "#ccfbf1",
        primaryText: "#0f766e",

        // accents
        warm: "#f59e0b",
        warmSoft: "#fef3c7",
        danger: "#ef4444",
        dangerSoft: "#fee2e2",
        success: "#10b981",
        successSoft: "#d1fae5",
        info: "#0ea5e9",
        infoSoft: "#e0f2fe",
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-sans)', 'system-ui', 'sans-serif'], // same as sans, we'll use weight
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.04)',
        cardHover: '0 4px 12px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.06)',
        floating: '0 10px 32px rgba(15, 23, 42, 0.10), 0 0 0 1px rgba(15, 23, 42, 0.06)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        rise: 'rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        pulseSoft: 'pulseSoft 2.6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
