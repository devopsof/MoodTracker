#!/bin/bash
# MoodTracker Environment Setup Script
# This script helps you configure your MoodTracker environment for AWS deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SKIP_AWS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-aws)
      SKIP_AWS=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo -e "${CYAN}🚀 MoodTracker Environment Setup${NC}"
echo -e "${CYAN}=================================${NC}"
echo ""

# Check prerequisites
echo -e "${CYAN}📋 Checking prerequisites...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: v$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check AWS CLI (optional)
if [ "$SKIP_AWS" = false ]; then
    if command -v aws &> /dev/null; then
        AWS_VERSION=$(aws --version 2>&1)
        echo -e "${GREEN}✅ AWS CLI: $AWS_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️ AWS CLI not found. Install from https://aws.amazon.com/cli/${NC}"
        echo -e "${YELLOW}   You can skip this check with --skip-aws flag${NC}"
    fi
fi

echo ""

# Install dependencies
echo -e "${CYAN}📦 Installing dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""

# Create environment file
echo -e "${CYAN}⚙️ Setting up environment configuration...${NC}"

if [ ! -f ".env.example" ]; then
    echo -e "${RED}❌ .env.example file not found!${NC}"
    exit 1
fi

if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local from template${NC}"
else
    echo -e "${YELLOW}⚠️ .env.local already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ $overwrite == "y" || $overwrite == "Y" ]]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Overwrote .env.local with template${NC}"
    fi
fi

echo ""

# Interactive environment configuration
echo -e "${CYAN}🔧 Environment Configuration${NC}"
echo -e "${CYAN}Please provide your AWS configuration details:${NC}"
echo -e "${YELLOW}(Press Enter to keep existing values or skip)${NC}"
echo ""

# Function to update environment variable
update_env_var() {
    local var_name="$1"
    local description="$2"
    local current_value="$3"
    
    echo -e "${CYAN}$description${NC}"
    if [ -n "$current_value" ]; then
        echo -e "${YELLOW}Current: $current_value${NC}"
    fi
    read -p "Enter $var_name: " new_value
    
    if [ -n "$new_value" ]; then
        sed -i.bak "s|$var_name=.*|$var_name=$new_value|" .env.local
        rm .env.local.bak
        echo -e "${GREEN}✅ Updated $var_name${NC}"
    else
        echo -e "${YELLOW}⏭️ Skipped $var_name${NC}"
    fi
    echo ""
}

# Extract current values
current_region=$(grep "VITE_AWS_REGION=" .env.local | cut -d'=' -f2 | tr -d ' ')
current_pool_id=$(grep "VITE_COGNITO_USER_POOL_ID=" .env.local | cut -d'=' -f2 | tr -d ' ')
current_client_id=$(grep "VITE_COGNITO_CLIENT_ID=" .env.local | cut -d'=' -f2 | tr -d ' ')
current_api_url=$(grep "VITE_API_BASE_URL=" .env.local | cut -d'=' -f2 | tr -d ' ')

# Update environment variables
update_env_var "VITE_AWS_REGION" "AWS Region (e.g., us-east-1):" "$current_region"
update_env_var "VITE_COGNITO_USER_POOL_ID" "Cognito User Pool ID (e.g., us-east-1_XXXXXXXXX):" "$current_pool_id"
update_env_var "VITE_COGNITO_CLIENT_ID" "Cognito Client ID:" "$current_client_id"
update_env_var "VITE_API_BASE_URL" "API Gateway URL (e.g., https://api.example.com/prod):" "$current_api_url"

echo -e "${GREEN}✅ Environment configuration saved to .env.local${NC}"

echo ""

# Test build
echo -e "${CYAN}🔨 Testing build...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed. Please check your environment configuration.${NC}"
    echo -e "${CYAN}   Review .env.local and ensure all values are correct.${NC}"
    exit 1
fi

echo ""

# Final instructions
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${CYAN}📚 Next Steps:${NC}"
echo -e "${CYAN}1. Review your .env.local file and update any remaining values${NC}"
echo -e "${CYAN}2. Configure AWS CLI: aws configure${NC}"
echo -e "${CYAN}3. Deploy to S3: ./aws/setup-s3.sh your-unique-bucket-name${NC}"
echo ""
echo -e "${CYAN}📖 Documentation:${NC}"
echo -e "${CYAN}   Deployment Guide: docs/DEPLOYMENT.md${NC}"
echo -e "${CYAN}   README: README.md${NC}"
echo ""
echo -e "${CYAN}💡 Need help? Check the troubleshooting section in docs/DEPLOYMENT.md${NC}"
