import React, { useEffect, useState } from 'react';

interface ResultGaugeProps {
  score: number; // 0.0 to 1.0
  isAuthentic: boolean;
  size?: number;
  strokeWidth?: number;
}

export const ResultGauge: React.FC<ResultGaugeProps> = ({
  score,
  isAuthentic,
  size = 180,
  strokeWidth = 14,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Smooth counting transition simulation
    const duration = 1200;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Easing out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(easeProgress * score);

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const strokeDashoffset = circumference - animatedScore * circumference;

  const getGaugeColor = () => {
    if (isAuthentic) return '#2DE0C2'; // Brand teal
    return score > 0.6 ? '#FFB648' : '#FF5577'; // Amber vs Coral red
  };

  const color = getGaugeColor();

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-75"
        />
      </svg>

      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-extrabold tracking-tight" style={{ color }}>
          {Math.round(animatedScore * 100)}%
        </span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
          {isAuthentic ? 'Confidence' : 'Risk Index'}
        </span>
      </div>
    </div>
  );
};
