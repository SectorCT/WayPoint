# WayPoint iOS Build Setup Script
# Run this script to prepare your environment for iOS builds

Write-Host "🚀 WayPoint iOS Build Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm." -ForegroundColor Red
    exit 1
}

# Install EAS CLI
Write-Host "Installing EAS CLI..." -ForegroundColor Yellow
try {
    npm install -g eas-cli
    Write-Host "✅ EAS CLI installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install EAS CLI. Please run: npm install -g eas-cli" -ForegroundColor Red
}

# Install Expo CLI
Write-Host "Installing Expo CLI..." -ForegroundColor Yellow
try {
    npm install -g @expo/cli
    Write-Host "✅ Expo CLI installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Expo CLI. Please run: npm install -g @expo/cli" -ForegroundColor Red
}

# Check current directory
Write-Host "Checking project structure..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✅ Found package.json" -ForegroundColor Green
} else {
    Write-Host "❌ package.json not found. Please run this script from the Client directory." -ForegroundColor Red
    exit 1
}

# Install project dependencies
Write-Host "Installing project dependencies..." -ForegroundColor Yellow
try {
    npm install --legacy-peer-deps
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
}

# Check if Docker is running (for backend)
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker not found. Make sure Docker Desktop is installed and running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start your backend server: cd ../server && docker-compose up -d" -ForegroundColor White
Write-Host "2. Login to Expo: eas login" -ForegroundColor White
Write-Host "3. Configure your project: eas build:configure" -ForegroundColor White
Write-Host "4. Build for iOS: eas build --platform ios --profile development" -ForegroundColor White
Write-Host ""
Write-Host "Your PC's IP address: 192.168.0.109" -ForegroundColor Cyan
Write-Host "API URL configured: http://192.168.0.109:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed instructions, see: BUILD_GUIDE.md" -ForegroundColor Cyan
