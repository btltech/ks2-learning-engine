import { useState, useEffect } from 'react';
import { progressVisualizationService, ProgressDataPoint } from '../services/progressVisualizationService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  subject?: string;
  days?: number;
}

export default function ProgressChart({ subject, days = 30 }: Props) {
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [summary, setSummary] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalTime: 0,
    topSubject: 'N/A',
    improvement: 0,
  });

  useEffect(() => {
    loadData();
  }, [subject, days]);

  const loadData = () => {
    const data = progressVisualizationService.getProgressData(subject, days);
    setProgressData(data);

    const weeklySummary = progressVisualizationService.getWeeklySummary();
    setSummary(weeklySummary);
  };

  // Prepare chart data
  const chartData = {
    labels: progressData.map((d) => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: subject
      ? [
          {
            label: subject,
            data: progressData.map((d) => d.score),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ]
      : [
          {
            label: 'Maths',
            data: progressData.filter((d) => d.subject === 'Maths').map((d) => d.score),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
          {
            label: 'English',
            data: progressData.filter((d) => d.subject === 'English').map((d) => d.score),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Science',
            data: progressData.filter((d) => d.subject === 'Science').map((d) => d.score),
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.4,
          },
        ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📈 Progress Over Time
        </h2>
        <p className="text-gray-600">
          {subject || 'All subjects'} • Last {days} days
        </p>
      </div>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {summary.totalQuizzes}
          </div>
          <div className="text-sm text-blue-800">Quizzes</div>
        </div>

        <div className="bg-green-50 p-4 rounded-xl">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {summary.averageScore}%
          </div>
          <div className="text-sm text-green-800">Avg Score</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {summary.totalTime}m
          </div>
          <div className="text-sm text-purple-800">Time Spent</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {summary.improvement > 0 ? '+' : ''}
            {summary.improvement}%
          </div>
          <div className="text-sm text-orange-800">Improvement</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-4">
        {progressData.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p>No progress data yet</p>
              <p className="text-sm mt-2">Complete quizzes to see your progress!</p>
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {summary.topSubject !== 'N/A' && (
        <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
          <h3 className="font-bold text-purple-900 mb-2">💡 Insights</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>
                Your strongest subject this week is <strong>{summary.topSubject}</strong>
              </span>
            </li>
            {summary.improvement > 5 && (
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>
                  Great progress! You improved by <strong>{summary.improvement}%</strong> this
                  week
                </span>
              </li>
            )}
            {summary.improvement < -5 && (
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                <span>
                  Keep practicing! Try reviewing topics you found challenging
                </span>
              </li>
            )}
            {summary.totalQuizzes < 5 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Try to complete at least 5 quizzes per week for best results
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
