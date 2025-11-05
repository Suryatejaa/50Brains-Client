#!/usr/bin/env node

console.log('🚀 Starting 50BraIns Web App in Production Mode...');
console.log('📡 Railway Production URLs:');
console.log('   API: https://api.50brains.in');
console.log('   WebSocket: wss://websocket-gateway-production-dbb2.up.railway.app');
console.log('   Frontend: http://localhost:5174\n');

// Set production environment variables
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.50brains.in';
process.env.NEXT_PUBLIC_WEBSOCKET_URL = 'wss://websocket-gateway-production-dbb2.up.railway.app';
process.env.NEXT_PUBLIC_APP_URL = 'https://your-production-domain.com';

// Start Next.js
const { spawn } = require('child_process');

const nextProcess = spawn('npx', ['next', 'start', '--port', '5174'], {
    stdio: 'inherit',
    shell: true,
    env: process.env
});

nextProcess.on('error', (error) => {
    console.error('❌ Error starting production server:', error);
    process.exit(1);
});

nextProcess.on('close', (code) => {
    console.log(`\n📦 Production server exited with code ${code}`);
    process.exit(code);
});

// Handle cleanup
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down production server...');
    nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down production server...');
    nextProcess.kill('SIGTERM');
});