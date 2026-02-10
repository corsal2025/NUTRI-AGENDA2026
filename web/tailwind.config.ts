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
                background: "#F8FAFC", // Light gray/blueish background
                foreground: "#1E293B", // Slate 800
                primary: {
                    DEFAULT: "#8A1556", // Veronica's Magenta
                    50: "#FDF2F8",
                    100: "#FCE7F3",
                    500: "#EC4899",
                    600: "#DB2777",
                    700: "#BE185D",
                    800: "#9D174D",
                    900: "#831843",
                },
                secondary: {
                    DEFAULT: "#64748B", // Slate 500
                },
                success: "#10B981",
                warning: "#F59E0B",
                danger: "#EF4444",
                card: {
                    DEFAULT: "#FFFFFF",
                }
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            }
        },
    },
    plugins: [],
};
export default config;
