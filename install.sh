#!/bin/bash

# PSYOPS - Solana Trading Copilot Installation Script

echo "Installing nvm (Node Version Manager)..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Load nvm into current shell session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Installing Node.js 22..."
nvm install 22
nvm use 22
nvm alias default 22

echo "Node.js version:"
node --version

echo "npm version:"
npm --version

echo "Installing project dependencies..."
npm install

echo ""
echo "Installation complete!"
echo "If this is a new terminal session, run: source ~/.bashrc"
echo "Then you can start the application."
