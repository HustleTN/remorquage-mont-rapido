#!/bin/bash

# Remorquage Mont Rapido - Mac Setup Script
# This script automatically sets up the project on macOS

set -e  # Exit on error

echo "🚛 Remorquage Mont Rapido - Mac Setup Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    print_warning "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    print_success "Homebrew installed"
else
    print_success "Homebrew is already installed"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Installing Node.js..."
    brew install node
    print_success "Node.js installed"
else
    NODE_VERSION=$(node -v)
    print_success "Node.js is already installed ($NODE_VERSION)"
fi

# Check Node version (should be 18+)
NODE_MAJOR_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
    print_warning "Node.js version is too old. Upgrading..."
    brew upgrade node
    print_success "Node.js upgraded"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install Node.js first."
    exit 1
else
    NPM_VERSION=$(npm -v)
    print_success "npm is installed ($NPM_VERSION)"
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    print_warning "Git not found. Installing Git..."
    brew install git
    print_success "Git installed"
else
    print_success "Git is already installed"
fi

echo ""
print_info "Installing project dependencies..."
echo ""

# Install npm dependencies
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""
print_info "Setting up environment variables..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_warning ".env.local not found. Creating from template..."

    # Create .env.local with prompts
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kfgziltkgyixlconiasv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZ3ppbHRrZ3lpeGxjb25pYXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDAzOTksImV4cCI6MjA4MDc3NjM5OX0.7dYYu-DxIME47wow2AwDjXRa4DxU6f_RKB7uERrXahY

# Mapbox Configuration
# Get your free token at: https://account.mapbox.com/access-tokens/
# Free tier: 100,000 map loads per month
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoicmFwaWRvbW9udCIsImEiOiJjbWl4OWNuejUwMXh2M2VzN3FicjZueHU2In0.wfh6RHhZX0bWADa3LklUFg

# Resend Configuration
# Get your free API key at: https://resend.com/api-keys
# Free tier: 3,000 emails per month
RESEND_API_KEY=your_resend_api_key_here

# App URL (update in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

    print_success ".env.local created"
else
    print_success ".env.local already exists"
fi

echo ""
print_success "Setup completed successfully!"
echo ""
print_info "To start the development server, run:"
echo -e "${GREEN}npm run dev${NC}"
echo ""
print_info "The app will be available at:"
echo -e "${GREEN}http://localhost:3000${NC}"
echo ""
print_info "Driver login:"
echo -e "${GREEN}http://localhost:3000/driver/login${NC}"
echo -e "  Email: raed@remorquagemontrapido.ca"
echo -e "  PIN: 1234"
echo ""
print_warning "Note: Make sure to update your .env.local file with your own API keys if needed!"
echo ""
print_info "Happy coding! 🚀"
