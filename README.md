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

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

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

## 🚀 Deployment

See [Deployment Guide](docs/DEPLOYMENT.md) for AWS setup.

```bash
npm run build
cd deployment
./deploy-to-s3-clean.ps1
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 Links

1. Youtube Demo - https://youtu.be/B_iFj0kwgsA
2. Blog - https://moodflow.hashnode.dev/

---

**Built with ❤️ for mental wellness tracking**
