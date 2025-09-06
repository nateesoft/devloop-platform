'use client';

import React from 'react';

interface TabsComponentProps {
  color?: string;
  size?: number;
}

const TabsComponent: React.FC<TabsComponentProps> = ({ color = '#8B5CF6', size = 60 }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 60 48" className="mx-auto">
    {/* Container background */}
    <rect 
      x="2" 
      y="12" 
      width="56" 
      height="32" 
      fill="white" 
      stroke={color} 
      strokeWidth="2"
      rx="4"
    />
    {/* Tab 1 - Active */}
    <rect 
      x="5" 
      y="5" 
      width="16" 
      height="12" 
      fill={color} 
      stroke={color} 
      strokeWidth="1"
      rx="3"
    />
    <text 
      x="13" 
      y="13" 
      fill="white" 
      fontSize="6" 
      textAnchor="middle"
      fontWeight="bold"
    >
      Tab1
    </text>
    {/* Tab 2 - Inactive */}
    <rect 
      x="22" 
      y="5" 
      width="16" 
      height="12" 
      fill="white" 
      stroke={color} 
      strokeWidth="1"
      rx="3"
    />
    <text 
      x="30" 
      y="13" 
      fill={color} 
      fontSize="6" 
      textAnchor="middle"
      fontWeight="bold"
    >
      Tab2
    </text>
    {/* Tab 3 - Inactive */}
    <rect 
      x="39" 
      y="5" 
      width="16" 
      height="12" 
      fill="white" 
      stroke={color} 
      strokeWidth="1"
      rx="3"
    />
    <text 
      x="47" 
      y="13" 
      fill={color} 
      fontSize="6" 
      textAnchor="middle"
      fontWeight="bold"
    >
      Tab3
    </text>
    {/* Content area with sample content */}
    <rect 
      x="7" 
      y="18" 
      width="46" 
      height="4" 
      fill={color} 
      opacity="0.3"
      rx="1"
    />
    <rect 
      x="7" 
      y="25" 
      width="35" 
      height="3" 
      fill={color} 
      opacity="0.2"
      rx="1"
    />
    <rect 
      x="7" 
      y="31" 
      width="42" 
      height="3" 
      fill={color} 
      opacity="0.2"
      rx="1"
    />
    <rect 
      x="7" 
      y="37" 
      width="28" 
      height="3" 
      fill={color} 
      opacity="0.2"
      rx="1"
    />
  </svg>
);

export default TabsComponent;