"use client";

import React from 'react';
import { GameSession } from '@/types';

interface PerformanceChartProps {
  sessions: GameSession[];
  maxSessions?: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  sessions, 
  maxSessions = 10 
}) => {
  // Get the most recent sessions for the chart
  const recentSessions = sessions
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-maxSessions);

  if (recentSessions.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <p>No data to display</p>
          <p className="text-sm text-slate-500">Complete some quizzes to see your performance trend</p>
        </div>
      </div>
    );
  }

  // Calculate chart data
  const maxScore = 100; // percentage
  const minScore = 0;
  const chartHeight = 160;
  const chartWidth = 600;
  const padding = 40;

  const dataPoints = recentSessions.map((session, index) => {
    const scorePercentage = (session.score / session.totalQuestions) * 100;
    const x = padding + (index / Math.max(1, recentSessions.length - 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - ((scorePercentage - minScore) / (maxScore - minScore)) * (chartHeight - 2 * padding);
    return { x, y, score: scorePercentage, session };
  });

  // Create SVG path for the line
  const pathData = dataPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Create area path for gradient fill
  const areaPathData = `${pathData} L ${dataPoints[dataPoints.length - 1].x} ${chartHeight - padding} L ${dataPoints[0].x} ${chartHeight - padding} Z`;

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#16A34A';
    if (score >= 70) return '#F59E0B';
    return '#DC2626';
  };

  return (
    <div className="relative">
      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = chartHeight - padding - ((value - minScore) / (maxScore - minScore)) * (chartHeight - 2 * padding);
          return (
            <g key={value}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="rgb(148 163 184 / 0.2)"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={padding - 10}
                y={y + 4}
                fill="rgb(148 163 184 / 0.6)"
                fontSize="12"
                textAnchor="end"
              >
                {value}%
              </text>
            </g>
          );
        })}

        {/* Area gradient */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#16A34A" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {dataPoints.length > 1 && (
          <path
            d={areaPathData}
            fill="url(#scoreGradient)"
            opacity="0.5"
          />
        )}

        {/* Line */}
        {dataPoints.length > 1 && (
          <path
            d={pathData}
            fill="none"
            stroke="#16A34A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={getScoreColor(point.score)}
              stroke="white"
              strokeWidth="2"
              className="hover:r-6 transition-all duration-200 cursor-pointer"
            />
            {/* Tooltip on hover */}
            <g className="opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <rect
                x={point.x - 35}
                y={point.y - 35}
                width="70"
                height="25"
                rx="4"
                fill="rgb(30 41 59)"
                stroke="rgb(148 163 184 / 0.2)"
              />
              <text
                x={point.x}
                y={point.y - 18}
                fill="white"
                fontSize="12"
                textAnchor="middle"
              >
                {Math.round(point.score)}%
              </text>
            </g>
          </g>
        ))}

        {/* X-axis labels */}
        {dataPoints.map((point, index) => {
          if (index % Math.max(1, Math.floor(dataPoints.length / 5)) === 0) {
            const date = new Date(point.session.date);
            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <text
                key={index}
                x={point.x}
                y={chartHeight - padding + 20}
                fill="rgb(148 163 184 / 0.6)"
                fontSize="11"
                textAnchor="middle"
              >
                {label}
              </text>
            );
          }
          return null;
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-dart-green"></div>
          <span className="text-slate-300">Excellent (90%+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-dart-gold"></div>
          <span className="text-slate-300">Good (70-89%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-dart-red"></div>
          <span className="text-slate-300">Needs Work (&lt;70%)</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;