/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Strict Brand Palette
                background: "#000926", // Deep Navy
                primary: "#0F52BA",    // Sapphire
                secondary: "#A6C5D7",  // Powder Blue
                surface: "#D6E6F3",    // Ice Blue (use with opacity for glass)

                // Functional Colors
                success: "#22C55E",
                error: "#EF4444",
                warning: "#EAB308",

                // Text Colors
                "text-main": "#FFFFFF",
                "text-muted": "#A6C5D7",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'scale-fade': 'scaleFade 0.2s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                scaleFade: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                }
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(180deg, rgba(214, 230, 243, 0.05) 0%, rgba(214, 230, 243, 0.02) 100%)',
            }
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}
