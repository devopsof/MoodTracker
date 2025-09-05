# MoodFlow 🌈

A beautiful, intuitive mood tracking application with powerful analytics and insights. Help users understand their emotional patterns, build better habits, and nurture their mental wellness.

## ✨ Features

### 🎨 Beautiful Landing Page
- **Hero Section**: Stunning animated gradient background with compelling call-to-action
- **Features Showcase**: Three main feature cards (Smart Analytics, Calendar Heatmap, Goal Tracking)
- **How It Works**: Step-by-step guide showing the user journey
- **Feature Highlights**: Visual mockups of analytics dashboard and calendar heatmap
- **Benefits Section**: Key value propositions with icons
- **Testimonials**: Rotating user testimonials
- **Responsive Design**: Fully responsive across all device sizes

### 📊 Core Application Features
- **Mood Tracking**: Quick and intuitive mood logging with emoji interface
- **Smart Analytics**: Beautiful charts and trend analysis
- **Calendar Heatmap**: Year-in-pixels view of emotional journey
- **Goal Setting**: Track wellness goals and build habits
- **Notes & Context**: Add detailed notes and activity tags
- **Secure Authentication**: AWS Cognito integration
- **Data Privacy**: All data stays secure and private

## 🚀 Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Authentication**: AWS Cognito
- **Database**: AWS DynamoDB
- **Charts**: Chart.js with React Chart.js 2
- **Build Tool**: Vite
- **Deployment**: AWS S3 + CloudFront

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Analytics.jsx    # Charts and analytics
│   ├── CalendarHeatmap.jsx
│   ├── EntryForm.jsx    # Mood entry form
│   ├── EntryList.jsx    # List of mood entries
│   └── ...
├── pages/              # Main application pages
│   ├── LandingPage.jsx # New marketing landing page
│   ├── DashboardPage.jsx
│   ├── LoginPage.jsx
│   └── VerifyEmailPage.jsx
├── context/            # React context providers
│   └── AuthContext.jsx
├── utils/              # Utility functions
│   ├── api.js          # API calls
│   └── constants.js
└── lib/                # External service configurations
    └── cognitoAuth.js
```

## 🎯 Landing Page Features

The landing page (`/src/pages/LandingPage.jsx`) includes:

### Navigation Flow
- **Unauthenticated users**: Land on marketing page → CTA buttons lead to login
- **Authenticated users**: Automatically redirect to dashboard
- **Smooth transitions**: Framer Motion page transitions between routes

### Sections
1. **Header**: Navigation with logo and CTA button
2. **Hero**: Large emotional impact with animated background
3. **Features**: Three feature cards with hover animations
4. **How It Works**: Step-by-step process explanation
5. **Feature Highlights**: Visual mockups of app functionality
6. **Benefits**: Value proposition grid
7. **Testimonials**: Rotating user testimonials
8. **Final CTA**: Conversion-focused call-to-action
9. **Footer**: Simple footer with branding

### Animations
- **Scroll-triggered animations**: Elements animate in as user scrolls
- **Hover effects**: Interactive elements with smooth transitions
- **Background animations**: Gradient background with floating orbs
- **Page transitions**: Smooth transitions between routes

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MoodTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.local` and configure AWS Cognito settings
   - Set up your AWS DynamoDB table
   - Configure CloudFront distribution (optional)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🌐 Routing

- `/` - Landing page (redirects to dashboard if authenticated)
- `/login` - Authentication page
- `/dashboard` - Main application dashboard (protected)
- `*` - Catch-all redirects to landing page

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: 320px - 767px
- Tablet: 768px - 1024px
- Desktop: 1025px+

## 🎨 Design System

### Colors
- Primary gradient: Cyan to Purple
- Background: Multi-color animated gradient
- Text: White with various opacity levels
- Interactive elements: Glass-morphism effects

### Typography
- Font family: Inter
- Headings: Bold, large scale for impact
- Body text: Medium weight, readable spacing

### Animations
- Duration: 0.3s - 0.8s for most interactions
- Easing: Ease-in-out for natural feel
- Scroll animations: Trigger once when in view

## 🔧 Key Dependencies

- `react` & `react-dom`: Core React
- `framer-motion`: Animations and page transitions
- `react-router-dom`: Client-side routing
- `tailwindcss`: Utility-first CSS framework
- `amazon-cognito-identity-js`: Authentication
- `chart.js` & `react-chartjs-2`: Data visualization

## 📈 Performance Optimizations

- **Code splitting**: React Router lazy loading
- **Image optimization**: Proper sizing and formats
- **Animation performance**: GPU-accelerated transforms
- **Bundle optimization**: Vite build optimizations
- **Lazy loading**: Scroll-triggered content loading

## 🔒 Security Features

- Secure authentication with AWS Cognito
- Protected routes for authenticated content
- Data encryption in transit and at rest
- No sensitive data in client-side code

## 🚀 Deployment

The application is configured for AWS deployment:
1. **S3**: Static file hosting
2. **CloudFront**: CDN and global distribution
3. **DynamoDB**: Data storage
4. **Cognito**: User authentication

## 🎉 Getting Started

1. Visit the landing page to learn about MoodFlow
2. Click "Get Started" to create an account
3. Begin tracking your mood with the intuitive interface
4. Explore analytics and insights to understand patterns
5. Set goals and build positive habits

## 📄 License

This project is private and proprietary.

---

Made with 💜 for mental wellness and emotional health.
