import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "rgb(var(--bg) / <alpha-value>)",
                foreground: "rgb(var(--text) / <alpha-value>)",
                card: {
                    DEFAULT: "rgb(var(--card-bg) / <alpha-value>)",
                    foreground: "rgb(var(--text) / <alpha-value>)",
                },
                popover: {
                    DEFAULT: "rgb(var(--card-bg) / <alpha-value>)",
                    foreground: "rgb(var(--text) / <alpha-value>)",
                },
                primary: {
                    DEFAULT: "rgb(var(--text) / <alpha-value>)",
                    foreground: "rgb(var(--bg) / <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "var(--btn-bg)",
                    foreground: "rgb(var(--text) / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "var(--btn-bg)",
                    foreground: "rgb(var(--text-muted) / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "rgb(var(--accent) / <alpha-value>)",
                    foreground: "rgb(var(--bg) / <alpha-value>)",
                },
                destructive: {
                    DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
                    foreground: "#ffffff",
                },
                border: "var(--border)",
                input: "var(--border)",
                ring: "rgb(var(--accent) / <alpha-value>)",
                link: "rgb(var(--link-color) / <alpha-value>)",
                "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
                "text-faint": "rgb(var(--text-faint) / <alpha-value>)",
                "text-very-faint": "rgb(var(--text-very-faint) / <alpha-value>)",
                chart: {
                    "1": "hsl(12 76% 61%)",
                    "2": "hsl(173 58% 39%)",
                    "3": "hsl(197 37% 24%)",
                    "4": "hsl(43 74% 66%)",
                    "5": "hsl(27 87% 67%)",
                },
            },
            fontFamily: {
                heading: ["var(--font-space-mono)", "monospace"],
                body: ["var(--font-ibm-plex-sans)", "sans-serif"],
                mono: ["var(--font-jetbrains-mono)", "monospace"],
            },
            borderRadius: {
                lg: "14px",
                md: "8px",
                sm: "5px",
            },
            boxShadow: {
                card: "var(--shadow)",
                "card-hover": "var(--shadow-hover)",
                toggle: "var(--toggle-shadow)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
