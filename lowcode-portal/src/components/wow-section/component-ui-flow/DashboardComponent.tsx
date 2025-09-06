'use client';

import React from 'react';

interface DashboardComponentProps {
  color?: string;
  size?: number;
}

const DashboardComponent: React.FC<DashboardComponentProps> = ({ color = '#8B5CF6', size = 60 }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 60 48" className="mx-auto">
    {/* Main container */}
    <rect 
      x="2" 
      y="2" 
      width="56" 
      height="44" 
      fill="white" 
      stroke={color} 
      strokeWidth="2"
      rx="4"
    />
    
    {/* Top header bar */}
    <rect 
      x="2" 
      y="2" 
      width="56" 
      height="8" 
      fill={color} 
      rx="4"
    />
    
    {/* Dashboard title */}
    <rect 
      x="6" 
      y="4" 
      width="20" 
      height="4" 
      fill="white" 
      opacity="0.9"
      rx="1"
    />
    
    {/* Navigation menu items */}
    <circle cx="50" cy="6" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="54" cy="6" r="1.5" fill="white" opacity="0.8"/>
    
    {/* Widget 1 - Chart/Graph */}
    <rect 
      x="5" 
      y="13" 
      width="24" 
      height="15" 
      fill={color} 
      opacity="0.1"
      rx="2"
    />
    {/* Chart bars */}
    <rect x="8" y="23" width="2" height="3" fill={color} opacity="0.6"/>
    <rect x="11" y="20" width="2" height="6" fill={color} opacity="0.6"/>
    <rect x="14" y="18" width="2" height="8" fill={color} opacity="0.6"/>
    <rect x="17" y="21" width="2" height="5" fill={color} opacity="0.6"/>
    <rect x="20" y="19" width="2" height="7" fill={color} opacity="0.6"/>
    <rect x="23" y="22" width="2" height="4" fill={color} opacity="0.6"/>
    
    {/* Widget 2 - Stats card */}
    <rect 
      x="31" 
      y="13" 
      width="24" 
      height="15" 
      fill={color} 
      opacity="0.1"
      rx="2"
    />
    {/* Stats number */}
    <rect x="34" y="16" width="8" height="3" fill={color} opacity="0.6" rx="1"/>
    <rect x="34" y="20" width="6" height="2" fill={color} opacity="0.4" rx="1"/>
    <rect x="44" y="16" width="8" height="3" fill={color} opacity="0.6" rx="1"/>
    <rect x="44" y="20" width="6" height="2" fill={color} opacity="0.4" rx="1"/>
    
    {/* Widget 3 - Pie chart */}
    <rect 
      x="5" 
      y="30" 
      width="24" 
      height="13" 
      fill={color} 
      opacity="0.1"
      rx="2"
    />
    {/* Pie chart circle */}
    <circle cx="17" cy="36.5" r="4" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6"/>
    <path d="M17 32.5 A4 4 0 0 1 20 35.5 L17 36.5 Z" fill={color} opacity="0.8"/>
    <path d="M20 35.5 A4 4 0 0 1 17 40.5 L17 36.5 Z" fill={color} opacity="0.5"/>
    
    {/* Widget 4 - List/Table */}
    <rect 
      x="31" 
      y="30" 
      width="24" 
      height="13" 
      fill={color} 
      opacity="0.1"
      rx="2"
    />
    {/* List items */}
    <rect x="34" y="32" width="18" height="2" fill={color} opacity="0.4" rx="1"/>
    <rect x="34" y="35" width="15" height="2" fill={color} opacity="0.3" rx="1"/>
    <rect x="34" y="38" width="16" height="2" fill={color} opacity="0.3" rx="1"/>
    <rect x="34" y="41" width="14" height="2" fill={color} opacity="0.3" rx="1"/>
    
    {/* Dashboard icons */}
    <circle cx="12" cy="16" r="1" fill={color} opacity="0.7"/>
    <rect x="38" y="32" width="2" height="2" fill={color} opacity="0.7" rx="0.5"/>
  </svg>
);

export default DashboardComponent;