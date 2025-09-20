# 🌈 MoodFlow - Emotional Journey Tracker

A beautiful, modern mood tracking application with animated themes, powerful analytics, and intuitive design. Track your emotional journey with style and gain insights into your mental wellness patterns.

## ✨ Features

- 🎨 **Beautiful Animated UI**: Smooth gradient animations and glassmorphism effects
- 📊 **Mood Analytics**: Visualize patterns, trends, and emotional insights
- 📅 **Calendar Heatmap**: Year-at-a-glance mood visualization
- 🎯 **Smart Tracking**: Notes, tags, and multiple entries per day
- 🌙 **Theme System**: Smooth light/dark theme transitions
- 🔐 **Secure Authentication**: AWS Cognito integration
- 📱 **Fully Responsive**: Perfect on all devices
- ⚡ **Fast & Modern**: Built with React + Vite

## 🚀 Quick Start

### For Development
```bash
# Clone the repository
git clone https://github.com/yourusername/moodtracker.git
cd moodtracker

# Quick setup (recommended)
./setup.ps1          # Windows PowerShell
# OR
./setup.sh           # Mac/Linux

# Manual setup
npm install
cp .env.example .env.local
# Edit .env.local with your AWS configuration

# Start development server
npm run dev
```

### For Production Deployment 🌐

#### Option 1: Automated Deployment (GitHub Actions)
```bash
# 1. Fork/clone this repository
# 2. Configure GitHub secrets and variables (see docs/GITHUB_ACTIONS.md)
# 3. Push to main branch - automatic deployment!
git push origin main
```

#### Option 2: Manual Deployment
```bash
# Build for production
npm run build

# Deploy to AWS S3
.\deployment\deploy-to-s3.ps1 -BucketName "your-unique-bucket-name"  # Windows
# OR
./aws/setup-s3.sh your-unique-bucket-name                            # Mac/Linux
```

**📖 Full deployment guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📁 Project Structure

```
MoodTracker/
├── src/                     # Source code
│   ├── components/          # React components
│   ├── context/            # Context providers
│   ├── pages/              # Page components
│   ├── lib/                # External integrations
│   └── utils/              # Utilities & helpers
├── lambda/                 # AWS Lambda functions
├── deployment/             # Deployment scripts
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion
- **Backend**: AWS Lambda, API Gateway, DynamoDB
- **Auth**: AWS Cognito
- **Deployment**: S3 + CloudFront
- **Styling**: Custom CSS with animated gradients

## 🎨 Theme System

MoodFlow features a sophisticated theme system with:
- Continuous gradient animations (15s cycles)
- Smooth 1.5s theme transitions
- Seamless cross-page consistency
- No layout shifts or flashing
- Hidden scrollbars for clean aesthetics

## 📊 Analytics Features

- Mood trends over time
- Weekly/monthly patterns
- Tag frequency analysis
- Interactive calendar heatmap
- Daily mood summaries

## 🔧 Development

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Configure AWS credentials
# VITE_AWS_REGION=us-east-1
# VITE_COGNITO_USER_POOL_ID=your-pool-id
# VITE_COGNITO_CLIENT_ID=your-client-id
# VITE_API_GATEWAY_URL=your-api-url
```

### Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build
- `npm run lint` - Code linting

## 🚀 Deployment Options

### 🚀 Quick Deploy
1. **Automated CI/CD** - Push to main branch for auto-deployment via GitHub Actions
2. **One-Click Script** - Use our deployment scripts for instant setup
3. **Manual AWS CLI** - Full control with step-by-step commands

### 📚 Documentation
- **[Complete Deployment Guide](docs/DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[GitHub Actions Setup](docs/GITHUB_ACTIONS.md)** - Automated CI/CD configuration
- **[Environment Setup](setup.ps1)** - Quick environment configuration

### 🌐 Live Demo
After deployment, your app will be available at:
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

With CloudFront (recommended for production):
```
https://your-cloudfront-domain.cloudfront.net
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for mental wellness tracking**
