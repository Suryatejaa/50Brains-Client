/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // 🎨 50BraIns Glassmorphism Theme
                brand: {
                    primary: '#247eab',     // Cyan-blue for CTAs & accents
                    base: '#FFFFFF',        // Main background (paper white)
                    glass: 'rgba(255,255,255,0.6)', // Frosted cards
                    'light-blue': '#E0F5FE', // Hover BG, input focus highlight
                    soft: '#F8FBFF',        // Extra light backgrounds
                    text: {
                        main: '#1E1E1E',    // Headers and content
                        muted: '#5E6A79',   // Placeholder, secondary text
                    },
                    border: '#E5EAF2',     // Card, input borders
                },

                // Legacy primary/secondary for compatibility
                primary: {
                    50: '#E0F5FE',
                    100: '#BAE8FB',
                    200: '#7DD3F5',
                    300: '#247eab',  // Main brand color
                    400: '#4DAFED',
                    500: '#247eab',
                    600: '#1E90D4',
                    700: '#1A7CB8',
                    800: '#15689C',
                    900: '#105480',
                    950: '#0A3A5C',
                },

                // Status colors (minimal, glassmorphism-friendly)
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                info: '#247eab',

                // Reputation system colors
                reputation: {
                    bronze: '#CD7F32',
                    silver: '#C0C0C0',
                    gold: '#FFD700',
                    platinum: '#E5E4E2',
                    diamond: '#B9F2FF',
                    legend: '#FF69B4',
                },
            },

            // Glassmorphism effects
            backdropBlur: {
                sm: '4px',
                md: '10px',
                lg: '16px',
            },

            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'md-soft': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },

            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },

            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
                'glass-shimmer': 'glassShimmer 2s ease-in-out infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                bounceGentle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                glassShimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },

            spacing: {
                '18': '4.5rem',
                '88': '22rem',
            },

            maxWidth: {
                '8xl': '88rem',
                '9xl': '96rem',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio'),
    ],
};
