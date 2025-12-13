#!/bin/bash

echo ""
echo "  ============================================"
echo "       ApeX Cloner - Discord Server Cloner"
echo "       By ApeX Development"
echo "  ============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "  [ERROR] Node.js is not installed!"
    echo ""
    echo "  Please install Node.js:"
    echo "  - macOS: brew install node"
    echo "  - Linux: sudo apt install nodejs npm"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "  [INFO] Installing dependencies..."
    echo ""
    npm install --ignore-scripts
    echo ""
fi

# Run the application
echo "  [INFO] Starting ApeX Cloner..."
echo ""
node main.js
