'use client';

import React from 'react';

interface SettingsComponentProps {
  color?: string;
  size?: number;
}

const SettingsComponent: React.FC<SettingsComponentProps> = ({ color = '#8B5CF6', size = 60 }) => (
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
    
    {/* Header */}
    <rect 
      x="2" 
      y="2" 
      width="56" 
      height="8" 
      fill={color} 
      rx="4"
    />
    
    {/* Settings title */}
    <rect 
      x="6" 
      y="4" 
      width="18" 
      height="4" 
      fill="white" 
      opacity="0.9"
      rx="1"
    />
    
    {/* Gear icon in header */}
    <g transform="translate(50, 6)">
      <circle r="3" fill="white" opacity="0.8"/>
      <circle r="2" fill={color}/>
      <rect x="-0.5" y="-4" width="1" height="2" fill="white"/>
      <rect x="-0.5" y="2" width="1" height="2" fill="white"/>
      <rect x="-4" y="-0.5" width="2" height="1" fill="white"/>
      <rect x="2" y="-0.5" width="2" height="1" fill="white"/>
    </g>
    
    {/* Settings sections */}
    
    {/* Section 1 - General Settings */}
    <rect 
      x="5" 
      y="13" 
      width="50" 
      height="6" 
      fill={color} 
      opacity="0.1"
      rx="2"
    />
    <rect x="8" y="15" width="12" height="2" fill={color} opacity="0.5" rx="1"/>
    
    {/* Toggle switches */}
    <rect x="45" y="15" width="8" height="2" fill={color} opacity="0.3" rx="1"/>
    <circle cx="48" cy="16" r="1.5" fill={color} opacity="0.8"/>
    
    {/* Section 2 - Privacy Settings */}
    <rect 
      x="5" 
      y="21" 
      width="50" 
      height="6" 
      fill={color} 
      opacity="0.1"
      rx="2"
    />
    <rect x="8" y="23" width="15" height="2" fill={color} opacity="0.5" rx="1"/>
    
    {/* Checkbox */}
    <rect x="45" y="23" width="2" height="2" fill="none" stroke={color} strokeWidth="0.5"/>
    <polyline points="45.5,24 46,24.5 47.5,23" fill="none" stroke={color} strokeWidth="0.5"/>
    
    {/* Section 3 - Notification Settings */}
    <rect 
      x="5" 
      y="29" 
      width="50" 
      height="6" 
      fill={color} 
      opacity="0.1"
      rx="2"
    />
    <rect x="8" y="31" width="18" height="2" fill={color} opacity="0.5" rx="1"/>
    
    {/* Radio button */}
    <circle cx="46" cy="32" r="1.5" fill="none" stroke={color} strokeWidth="0.5"/>
    <circle cx="46" cy="32" r="0.8" fill={color} opacity="0.6"/>
    
    {/* Section 4 - Account Settings */}
    <rect 
      x="5" 
      y="37" 
      width="50" 
      height="6" 
      fill={color} 
      opacity="0.1"
      rx="2"
    />
    <rect x="8" y="39" width="14" height="2" fill={color} opacity="0.5" rx="1"/>
    
    {/* Dropdown arrow */}
    <polygon points="47,39.5 49,39.5 48,41" fill={color} opacity="0.6"/>
    
    {/* Setting icons */}
    <circle cx="22" cy="16" r="1" fill={color} opacity="0.6"/>
    <rect x="25" y="23" width="2" height="2" fill={color} opacity="0.6" rx="0.5"/>
    <circle cx="30" cy="32" r="1" fill={color} opacity="0.6"/>
    <rect x="25" y="39" width="2" height="2" fill={color} opacity="0.6" rx="1"/>
  </svg>
);

export default SettingsComponent;