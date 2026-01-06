/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#020617", // Dark Navy / Slate 950
                secondary: "#2563EB", // Neon Blue
                accent: "#22C55E", // Green
                surface: "#0F172A", // Slate 900 for cards/modals
                text: "#E5E7EB", // Light Gray
                "text-muted": "#94A3B8", // Slate 400
                error: "#EF4444",
                warning: "#EAB308",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}
