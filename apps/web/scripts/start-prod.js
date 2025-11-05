#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envLocalBackupPath = path.join(__dirname, '..', '.env.local.backup');

// Function to restore .env.local
function restoreEnvLocal() {
    if (fs.existsSync(envLocalBackupPath)) {
        fs.renameSync(envLocalBackupPath, envLocalPath);
        console.log('🔄 Restored .env.local');
    }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down production server...');
    restoreEnvLocal();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down production server...');
    restoreEnvLocal();
    process.exit(0);
});

async function startProdServer() {
    try {
        console.log('🚀 Starting 50BraIns in Production Mode...');
        console.log('📡 Using Railway Production URLs');
        console.log('   API: https://api.50brains.in');
        console.log('   WebSocket: wss://websocket-gateway-production-dbb2.up.railway.app\n');

        // Backup .env.local if it exists
        if (fs.existsSync(envLocalPath)) {
            fs.renameSync(envLocalPath, envLocalBackupPath);
            console.log('💾 Backed up .env.local temporarily');
        }

        // Start Next.js in production mode
        const nextProcess = spawn('npx', ['cross-env', 'NODE_ENV=production', 'next', 'start', '--port', '5174'], {
            stdio: 'inherit',
            shell: true,
            env: {
                ...process.env,
                NODE_ENV: 'production'
            }
        }); nextProcess.on('error', (error) => {
            console.error('❌ Error starting production server:', error);
            restoreEnvLocal();
            process.exit(1);
        });

        nextProcess.on('close', (code) => {
            console.log(`\n📦 Production server exited with code ${code}`);
            restoreEnvLocal();
            process.exit(code);
        });

    } catch (error) {
        console.error('❌ Failed to start production server:', error);
        restoreEnvLocal();
        process.exit(1);
    }
}

startProdServer();