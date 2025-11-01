/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    typedRoutes: true,
    // Remove console logs in production
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'] // Keep error and warn logs for debugging
        } : false,
    },
    images: {
        domains: [
            'api.50brains.com',
            'localhost',
            'api-gateway-production-c8bc.up.railway.app',
            'websocket-gateway-production-dbb2.up.railway.app'
        ],
        formats: ['image/webp', 'image/avif'],
    },
    env: {
        NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173',
        NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:4000',
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
