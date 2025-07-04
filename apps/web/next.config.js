/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    experimental: {
        typedRoutes: true,
    },
    images: {
        domains: ['api.50brains.com', 'localhost'],
        formats: ['image/webp', 'image/avif'],
    },
    env: {
        NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173',
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, 'src'),
        };
        return config;
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
