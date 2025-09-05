import React, { useState, useEffect } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const controls = useAnimation()
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.6, delay }}
      className="group"
    >
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
        <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-white/80 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

const Step = ({ number, title, description, delay = 0 }) => {
  const controls = useAnimation()
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 }
      }}
      transition={{ duration: 0.6, delay }}
      className="flex items-start space-x-6 group"
    >
      <div className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/70 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

const Benefit = ({ icon, text, delay = 0 }) => {
  const controls = useAnimation()
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 }
      }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-white font-medium">{text}</span>
    </motion.div>
  )
}

function LandingPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      text: "MoodFlow has completely changed how I understand my emotional patterns. I love seeing the beautiful visualizations of my mood journey!",
      author: "Sarah M.",
      rating: 5
    },
    {
      text: "The calendar heatmap is incredible - it's like seeing my year in pixels but for my emotions. Perfect for tracking progress.",
      author: "Alex K.",
      rating: 5
    },
    {
      text: "Simple, beautiful, and powerful. I've tried many mood trackers but this one actually keeps me coming back every day.",
      author: "Maria L.",
      rating: 5
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const handleGetStarted = () => {
    // Always navigate to login page for all users
    navigate('/login')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Floating orbs */}
      <div 
        className="fixed top-20 right-20 w-32 h-32 theme-orb-1 rounded-full blur-2xl" 
        style={{
          animation: 'floatOrb1 22s ease-in-out infinite'
        }}
      />
      <div 
        className="fixed bottom-20 left-20 w-40 h-40 theme-orb-2 rounded-full blur-2xl" 
        style={{
          animation: 'floatOrb2 28s ease-in-out infinite reverse'
        }}
      />
      <div 
        className="fixed top-1/2 left-1/3 w-24 h-24 theme-orb-3 rounded-full blur-3xl" 
        style={{
          animation: 'floatOrb3 25s ease-in-out infinite'
        }}
      />

      {/* Header */}
      <header className="relative z-10 bg-theme-glass border-b border-theme-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
              onClick={() => isAuthenticated ? navigate('/dashboard') : null}
            >
              <span className="text-3xl">🌈</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">MoodFlow</h1>
            </div>
            <button 
              onClick={handleGetStarted}
              className="px-6 py-3 rounded-2xl bg-white text-purple-700 hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Get Started with MoodFlow"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div 
              className="text-8xl mb-8 animate-bounce cursor-pointer hover:scale-110 transition-transform duration-300"
              onClick={() => isAuthenticated ? navigate('/dashboard') : null}
              title={isAuthenticated ? 'Go to Dashboard' : 'MoodFlow'}
            >
              🌈
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-8 leading-tight">
              Track Your <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Emotional</span> Journey
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Beautiful, intuitive mood tracking with powerful analytics and insights. 
              Discover patterns, build better habits, and nurture your mental wellness.
            </p>
            <motion.button
              onClick={handleGetStarted}
              className="px-12 py-6 rounded-3xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-400/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Start your mood tracking journey"
            >
              Start Your Journey 🚀
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Powerful Features for Your Wellbeing
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Everything you need to understand and improve your emotional health
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="📊"
              title="Smart Analytics"
              description="Visualize your mood patterns with beautiful charts and insights. Discover what affects your wellbeing most."
              delay={0.1}
            />
            <FeatureCard
              icon="📅"
              title="Calendar Heatmap"
              description="See your entire year at a glance with our colorful calendar heatmap. Track streaks and spot trends easily."
              delay={0.2}
            />
            <FeatureCard
              icon="🎯"
              title="Goal Tracking"
              description="Set wellness goals and track your progress. Build positive habits that stick and celebrate your wins."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Feature Highlights with Visuals */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              See Your Progress in Action
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Beautiful visualizations that make your emotional journey clear and actionable
            </p>
          </motion.div>

          {/* Feature highlight rows */}
          <div className="space-y-24">
            {/* Analytics Dashboard Mock */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Beautiful Analytics Dashboard</h3>
                <p className="text-white/80 text-base mb-8 leading-relaxed">
                  Transform your mood data into stunning visualizations. Our advanced analytics help you understand patterns, 
                  identify triggers, and celebrate progress with interactive charts and insights.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-white/90">
                    <span className="text-cyan-400">✓</span>
                    <span>Interactive mood trend charts</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/90">
                    <span className="text-cyan-400">✓</span>
                    <span>Activity correlation insights</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/90">
                    <span className="text-cyan-400">✓</span>
                    <span>Weekly and monthly summaries</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-3xl border border-white/20">
                {/* Mock Analytics Chart */}
                <div className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-semibold">Mood Trends</h4>
                    <span className="text-white/60 text-sm">Last 30 days</span>
                  </div>
                  <div className="h-32 flex items-end justify-between space-x-1">
                    {[...Array(15)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-t from-cyan-400 to-purple-500 rounded-t"
                        style={{
                          height: `${Math.random() * 100 + 20}%`,
                          width: '100%',
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-white/60 text-xs mt-2">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Calendar Heatmap Mock */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="lg:order-2">
                <h3 className="text-2xl font-bold text-white mb-6">Year in Pixels Heatmap</h3>
                <p className="text-white/80 text-base mb-8 leading-relaxed">
                  See your entire emotional year at a glance with our beautiful calendar heatmap. 
                  Each day is a pixel colored by your mood, creating a stunning visual story of your journey.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-white/90">
                    <span className="text-cyan-400">✓</span>
                    <span>365 days in one beautiful view</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/90">
                    <span className="text-cyan-400">✓</span>
                    <span>Color-coded mood intensity</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/90">
                    <span className="text-cyan-400">✓</span>
                    <span>Streak tracking and highlights</span>
                  </div>
                </div>
              </div>
              <div className="lg:order-1 bg-white/10 backdrop-blur-lg p-6 rounded-3xl border border-white/20">
                {/* Mock Calendar Heatmap */}
                <div className="bg-gradient-to-br from-purple-500/20 to-cyan-600/20 p-6 rounded-2xl">
                  <h4 className="text-white font-semibold mb-4">2024 Mood Calendar</h4>
                  <div className="grid grid-cols-12 gap-1">
                    {[...Array(365)].map((_, i) => {
                      const colors = ['bg-gray-600/30', 'bg-red-400/60', 'bg-yellow-400/60', 'bg-green-400/60', 'bg-cyan-400/60', 'bg-purple-400/60']
                      return (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-sm ${colors[Math.floor(Math.random() * colors.length)]}`}
                          style={{ animationDelay: `${i * 0.001}s` }}
                        />
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-white/60 text-xs mt-4">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>May</span>
                    <span>Jul</span>
                    <span>Sep</span>
                    <span>Nov</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              How MoodFlow Works
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Simple, intuitive, and effective - start tracking your mood in seconds
            </p>
          </motion.div>

          <div className="space-y-12">
            <Step
              number={1}
              title="Log Your Mood"
              description="Quick and easy mood logging with our beautiful emoji interface. Add notes and tags to capture the full picture."
              delay={0.1}
            />
            <Step
              number={2}
              title="Add Context"
              description="Tag activities, add notes, and capture what influenced your mood. The more context, the better insights."
              delay={0.2}
            />
            <Step
              number={3}
              title="Discover Insights"
              description="View beautiful analytics, spot patterns, and understand what makes you happiest. Knowledge is power."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Why Choose MoodFlow?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Benefit icon="🎨" text="Beautiful, intuitive design" delay={0.1} />
            <Benefit icon="📈" text="Advanced analytics & insights" delay={0.2} />
            <Benefit icon="🔒" text="Your data stays private & secure" delay={0.3} />
            <Benefit icon="⚡" text="Lightning-fast performance" delay={0.4} />
            <Benefit icon="📱" text="Works perfectly on all devices" delay={0.5} />
            <Benefit icon="🎯" text="Habit & goal tracking built-in" delay={0.6} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Loved by Users Worldwide
            </h2>
          </motion.div>

          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-xl text-white/90 mb-6 italic leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </p>
              <p className="text-white/70 font-semibold">
                — {testimonials[currentTestimonial].author}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 backdrop-blur-lg p-12 rounded-3xl border border-white/20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Join thousands of users who are already improving their mental wellness with MoodFlow.
              Your emotional health journey starts with a single click.
            </p>
            <motion.button
              onClick={handleGetStarted}
              className="px-12 py-6 rounded-3xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Get started with MoodFlow for free"
            >
              Get Started Free ✨
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div 
              className="flex items-center space-x-3 mb-4 md:mb-0 cursor-pointer hover:opacity-80 transition-opacity duration-300"
              onClick={() => isAuthenticated ? navigate('/dashboard') : null}
              title={isAuthenticated ? 'Go to Dashboard' : 'Home'}
            >
              <span className="text-2xl">🌈</span>
              <span className="text-xl font-bold text-white">MoodFlow</span>
            </div>
            <div className="text-white/60">
              © 2024 MoodFlow. Made with 💜 for your wellbeing.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
