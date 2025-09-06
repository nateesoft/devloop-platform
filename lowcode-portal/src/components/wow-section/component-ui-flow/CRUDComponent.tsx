'use client';

import React from 'react';

interface CRUDComponentProps {
  color?: string;
  size?: number;
}

const CRUDComponent: React.FC<CRUDComponentProps> = ({ color = '#8B5CF6', size = 60 }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 60 48" className="mx-auto">
    {/* Main container */}
    <rect 
      x="2" 
      y="4" 
      width="56" 
      height="40" 
      fill="white" 
      stroke={color} 
      strokeWidth="2"
      rx="4"
    />
    
    {/* Header with action buttons */}
    <rect 
      x="2" 
      y="4" 
      width="56" 
      height="10" 
      fill={color} 
      rx="4"
    />
    {/* Create button */}
    <rect 
      x="45" 
      y="6" 
      width="10" 
      height="6" 
      fill="white" 
      rx="2"
    />
    <text 
      x="50" 
      y="10.5" 
      fill={color} 
      fontSize="4" 
      textAnchor="middle"
      fontWeight="bold"
    >
      +
    </text>
    
    {/* Table header */}
    <rect 
      x="5" 
      y="16" 
      width="50" 
      height="6" 
      fill={color} 
      opacity="0.2"
      rx="1"
    />
    
    {/* Data rows */}
    <rect 
      x="5" 
      y="24" 
      width="50" 
      height="4" 
      fill={color} 
      opacity="0.1"
      rx="1"
    />
    <rect 
      x="5" 
      y="30" 
      width="50" 
      height="4" 
      fill={color} 
      opacity="0.1"
      rx="1"
    />
    <rect 
      x="5" 
      y="36" 
      width="50" 
      height="4" 
      fill={color} 
      opacity="0.1"
      rx="1"
    />
    
    {/* Action icons for each row */}
    {/* Row 1 actions */}
    <circle cx="47" cy="26" r="1.5" fill={color} opacity="0.6"/>
    <circle cx="51" cy="26" r="1.5" fill="red" opacity="0.6"/>
    
    {/* Row 2 actions */}
    <circle cx="47" cy="32" r="1.5" fill={color} opacity="0.6"/>
    <circle cx="51" cy="32" r="1.5" fill="red" opacity="0.6"/>
    
    {/* Row 3 actions */}
    <circle cx="47" cy="38" r="1.5" fill={color} opacity="0.6"/>
    <circle cx="51" cy="38" r="1.5" fill="red" opacity="0.6"/>
    
    {/* CRUD icons overlay */}
    {/* Create icon (plus) - already done above */}
    
    {/* Read icon (eye) */}
    <ellipse cx="10" cy="26" rx="2" ry="1" fill={color} opacity="0.7"/>
    <circle cx="10" cy="26" r="1" fill="white"/>
    
    {/* Update icon (pencil) */}
    <line x1="8" y1="34" x2="12" y2="30" stroke={color} strokeWidth="1" opacity="0.7"/>
    <circle cx="12" cy="30" r="1" fill={color} opacity="0.7"/>
    
    {/* Delete icon (trash) */}
    <rect x="8" y="36" width="4" height="4" fill="none" stroke="red" strokeWidth="1" opacity="0.7"/>
    <line x1="9" y1="36" x2="9" y2="40" stroke="red" strokeWidth="0.5" opacity="0.7"/>
    <line x1="11" y1="36" x2="11" y2="40" stroke="red" strokeWidth="0.5" opacity="0.7"/>
  </svg>
);

export default CRUDComponent;