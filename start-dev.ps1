# 50BraIns Client Development Startup Script (Windows PowerShell)

Write-Host "🚀 Starting 50BraIns Client Development Environment" -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Blue

# Check if backend is running on port 3000
Write-Host "📡 Checking if backend is running on port 3000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend API is running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend API is not running on port 3000" -ForegroundColor Red
    Write-Host "   Please start your backend server first" -ForegroundColor Yellow
}

# Check if port 5173 is available for frontend
Write-Host "🔍 Checking if port 5173 is available for frontend..." -ForegroundColor Yellow
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "❌ Port 5173 is already in use" -ForegroundColor Red
    Write-Host "   Attempting to free port 5173..." -ForegroundColor Yellow
    # Kill any process using port 5173
    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force
} else {
    Write-Host "✅ Port 5173 is available" -ForegroundColor Green
}

# Install dependencies if needed
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Start the development server
Write-Host "🔧 Starting Next.js development server on port 5173..." -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Blue
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Blue

npm run dev
