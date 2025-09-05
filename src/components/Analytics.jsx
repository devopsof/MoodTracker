import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { loadAnalytics } from '../utils/api'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
)

function Analytics({ userEmail }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userEmail) {
      fetchAnalytics()
    }
  }, [userEmail])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await loadAnalytics(userEmail, 7)
      console.log('Analytics data:', data)
      setAnalytics(data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Chart configuration
  const lineChartData = analytics ? {
    labels: analytics.dailyAverages.map(day => day.label),
    datasets: [
      {
        label: 'Daily Mood Average',
        data: analytics.dailyAverages.map(day => day.average),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        fill: true,
        tension: 0.4
      }
    ]
  } : null

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: '7-Day Mood Trend',
        color: 'white',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y
            if (value === null) return 'No entries'
            return `Average: ${value}/5`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white',
          stepSize: 1
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      }
    }
  }

  const barChartData = analytics ? {
    labels: ['😢 Very Sad', '😔 Sad', '😐 Neutral', '😊 Happy', '😄 Very Happy'],
    datasets: [
      {
        label: 'Mood Distribution',
        data: [
          analytics.moodDistribution[1] || 0,
          analytics.moodDistribution[2] || 0,
          analytics.moodDistribution[3] || 0,
          analytics.moodDistribution[4] || 0,
          analytics.moodDistribution[5] || 0
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',   // Red for very sad
          'rgba(245, 101, 101, 0.7)', // Light red for sad
          'rgba(156, 163, 175, 0.7)', // Gray for neutral
          'rgba(34, 197, 94, 0.7)',   // Green for happy
          'rgba(16, 185, 129, 0.7)'   // Bright green for very happy
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 101, 101, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 2
      }
    ]
  } : null

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Mood Distribution (Last 7 Days)',
        color: 'white',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white',
          stepSize: 1
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      }
    }
  }

  // Loading state - maintain same layout structure as final content
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-3xl mb-2 animate-pulse">📊</div>
                <div className="text-2xl font-bold text-white/50 mb-1">-.-</div>
                <div className="text-white/50 text-sm">Loading...</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <div className="text-center" style={{ height: '300px' }}>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-6xl mb-4 animate-spin">📊</div>
                  <div className="text-xl font-bold text-white mb-2">Loading Chart {i}</div>
                  <div className="text-white/70">Calculating trends...</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state - maintain same layout structure
  if (error) {
    return (
      <div className="space-y-6">
        {/* Summary Cards - Error State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-center">
                <div className="text-3xl mb-2">❌</div>
                <div className="text-2xl font-bold text-red-300 mb-1">Error</div>
                <div className="text-white/50 text-sm">No data</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Error Display */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">Analytics Unavailable</h2>
            <p className="text-white/70 mb-4 text-lg">Unable to load your mood analytics</p>
            <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-3 rounded-2xl bg-white/20 text-white hover:bg-white/30 transition-colors font-medium"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No data state - maintain same layout structure
  if (!analytics || analytics.totalEntries === 0) {
    return (
      <div className="space-y-6">
        {/* Summary Cards - No Data State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl mb-2">😊</div>
              <div className="text-2xl font-bold text-white/50 mb-1">0/5</div>
              <div className="text-white/70 text-sm">Average Mood</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-2xl font-bold text-white/50 mb-1">0</div>
              <div className="text-white/70 text-sm">Entries (7 days)</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-blue-300 mb-1">Stable</div>
              <div className="text-white/70 text-sm">Weekly Trend</div>
            </div>
          </div>
        </div>

        {/* Main No Data Display */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="text-center" style={{ minHeight: '300px' }}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-8xl mb-6">📝</div>
              <h2 className="text-3xl font-bold text-white mb-4">No Data Yet</h2>
              <p className="text-white/70 text-lg mb-6">Start tracking your mood to see beautiful analytics here!</p>
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-6">
                <p className="text-blue-300 font-medium">💡 Tip: Switch to "Mood Entries" tab to add your first mood entry</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get trend emoji and color
  const getTrendInfo = (trend) => {
    switch (trend) {
      case 'improving':
        return { emoji: '📈', text: 'Improving', color: 'text-green-300' }
      case 'declining':
        return { emoji: '📉', text: 'Declining', color: 'text-red-300' }
      default:
        return { emoji: '📊', text: 'Stable', color: 'text-blue-300' }
    }
  }

  const trendInfo = getTrendInfo(analytics.weeklyTrend)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Mood */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="text-center">
            <div className="text-3xl mb-2">😊</div>
            <div className="text-2xl font-bold text-white">{analytics.averageMood}/5</div>
            <div className="text-white/70 text-sm">Average Mood</div>
          </div>
        </div>

        {/* Total Entries */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="text-center">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-white">{analytics.totalEntries}</div>
            <div className="text-white/70 text-sm">Entries (7 days)</div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="text-center">
            <div className="text-3xl mb-2">{trendInfo.emoji}</div>
            <div className={`text-2xl font-bold ${trendInfo.color}`}>{trendInfo.text}</div>
            <div className="text-white/70 text-sm">Weekly Trend</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend Chart */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          <div style={{ height: '300px' }}>
            {lineChartData && (
              <Line data={lineChartData} options={lineChartOptions} />
            )}
          </div>
        </div>

        {/* Mood Distribution Chart */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          <div style={{ height: '300px' }}>
            {barChartData && (
              <Bar data={barChartData} options={barChartOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
