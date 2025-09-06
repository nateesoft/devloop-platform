'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, FolderPlus, Layers } from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatsCounter: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  const stats: StatItem[] = [
    {
      id: 'visitors',
      label: 'Visitors',
      value: 125847,
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-400',
      bgColor: 'from-blue-600/20 to-blue-400/10'
    },
    {
      id: 'register',
      label: 'Register',
      value: 23156,
      icon: <UserPlus className="h-6 w-6" />,
      color: 'text-green-400',
      bgColor: 'from-green-600/20 to-green-400/10'
    },
    {
      id: 'newProjects',
      label: 'New Projects',
      value: 8942,
      icon: <FolderPlus className="h-6 w-6" />,
      color: 'text-purple-400',
      bgColor: 'from-purple-600/20 to-purple-400/10'
    },
    {
      id: 'allProjects',
      label: 'All Projects',
      value: 45789,
      icon: <Layers className="h-6 w-6" />,
      color: 'text-orange-400',
      bgColor: 'from-orange-600/20 to-orange-400/10'
    }
  ];

  // Initialize animated values
  useEffect(() => {
    const initialValues: Record<string, number> = {};
    stats.forEach(stat => {
      initialValues[stat.id] = 0;
    });
    setAnimatedValues(initialValues);
  }, []);

  // Trigger animation when component is visible
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Start counter animations
      stats.forEach((stat, index) => {
        const startDelay = index * 200; // Stagger animations
        const duration = 2500; // 2.5 seconds
        const steps = 60; // Number of animation steps
        const stepValue = stat.value / steps;
        
        let currentStep = 0;
        
        const stepTimer = setInterval(() => {
          currentStep++;
          const currentValue = Math.min(Math.floor(stepValue * currentStep), stat.value);
          
          setAnimatedValues(prev => ({
            ...prev,
            [stat.id]: currentValue
          }));
          
          if (currentStep >= steps) {
            clearInterval(stepTimer);
          }
        }, (duration / steps));
        
        // Clear timer after completion
        setTimeout(() => {
          clearInterval(stepTimer);
        }, duration + startDelay);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const FlipDigit: React.FC<{ digit: string; index: number }> = ({ digit, index }) => {
    return (
      <div 
        className="flip-digit inline-block"
        style={{ 
          animationDelay: `${index * 50}ms`,
          animationDuration: '0.6s'
        }}
      >
        <div className="relative h-12 w-8 mx-px overflow-hidden rounded-md bg-slate-900/50 backdrop-blur-sm border border-slate-700/50">
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-mono font-bold text-white">
            {digit}
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        @keyframes flipIn {
          from {
            transform: perspective(400px) rotateX(-90deg);
            opacity: 0;
          }
          to {
            transform: perspective(400px) rotateX(0deg);
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .flip-digit {
          animation: flipIn 0.6s ease-out forwards;
          transform: perspective(400px) rotateX(-90deg);
          opacity: 0;
        }
        
        .stats-card {
          animation: slideUp 0.8s ease-out forwards;
          transform: translateY(30px);
          opacity: 0;
        }
        
        .glow-effect {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
      
      <section className="py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.id}
                className={`stats-card relative group`}
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  animationDuration: '0.8s'
                }}
              >
                {/* Glow Background */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${stat.bgColor} rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 glow-effect`}></div>
                
                {/* Main Card */}
                <div className="relative bg-white/10 dark:bg-slate-800/20 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-slate-700/30 hover:border-white/30 dark:hover:border-slate-600/50 transition-all duration-300 hover:shadow-2xl transform hover:scale-105">
                  {/* Counter Display */}
                  <div className="flex items-center justify-center mb-2 min-h-[48px]">
                    {isVisible && (
                      <div className="flex items-center">
                        {formatNumber(animatedValues[stat.id] || 0).split('').map((digit, digitIndex) => (
                          <FlipDigit 
                            key={`${stat.id}-${digitIndex}`}
                            digit={digit === ',' ? ',' : digit}
                            index={digitIndex}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center">
                    {stat.label}
                  </div>
                  
                  {/* Decorative Line */}
                  <div className={`mt-2 h-1 bg-gradient-to-r ${stat.bgColor} rounded-full opacity-60`}></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Additional Visual Elements */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-full border border-white/20 dark:border-slate-700/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Live Statistics - Updated in Real Time
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default StatsCounter;