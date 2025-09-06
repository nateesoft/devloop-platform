'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  addEdge, 
  Connection, 
  useNodesState, 
  useEdgesState, 
  Background,
  Controls,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import UI Flow Components
import { TabsComponent, CRUDComponent, DashboardComponent, SettingsComponent } from './component-ui-flow';
import TemplateSelector from './component-ui-flow/TemplateSelector';
import { createNodesFromTemplate } from './utils/ui-templateHelpers';

// Enhanced Stick Figure for Actor nodes - keeping original shape but with modern styling
const EnhancedStickFigure = ({ color = '#3B82F6', size = 60, strokeWidth = 3 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 60 72" className="mx-auto">
    {/* Define gradients and filters for enhancement */}
    <defs>
      <linearGradient id={`stick-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.8 }} />
      </linearGradient>
      <filter id={`stick-glow-${color}`}>
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id={`stick-shadow-${color}`}>
        <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3"/>
      </filter>
    </defs>
    
    {/* Background glow effect */}
    <circle 
      cx="30" 
      cy="36" 
      r="25" 
      fill={color}
      opacity="0.05"
      filter={`url(#stick-shadow-${color})`}
    />
    
    {/* Head with enhanced styling */}
    <circle 
      cx="30" 
      cy="12" 
      r="8" 
      fill="none" 
      stroke={`url(#stick-gradient-${color})`}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      filter={`url(#stick-glow-${color})`}
    />
    
    {/* Inner head circle for depth */}
    <circle 
      cx="30" 
      cy="12" 
      r="6" 
      fill="none" 
      stroke={color}
      strokeWidth="1"
      opacity="0.3"
    />
    
    {/* Body with gradient stroke */}
    <line 
      x1="30" 
      y1="20" 
      x2="30" 
      y2="45" 
      stroke={`url(#stick-gradient-${color})`}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      filter={`url(#stick-glow-${color})`}
    />
    
    {/* Left arm with enhanced styling */}
    <line 
      x1="30" 
      y1="28" 
      x2="20" 
      y2="35" 
      stroke={`url(#stick-gradient-${color})`}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      filter={`url(#stick-glow-${color})`}
    />
    
    {/* Right arm with enhanced styling */}
    <line 
      x1="30" 
      y1="28" 
      x2="40" 
      y2="35" 
      stroke={`url(#stick-gradient-${color})`}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      filter={`url(#stick-glow-${color})`}
    />
    
    {/* Left leg with enhanced styling */}
    <line 
      x1="30" 
      y1="45" 
      x2="20" 
      y2="60" 
      stroke={`url(#stick-gradient-${color})`}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      filter={`url(#stick-glow-${color})`}
    />
    
    {/* Right leg with enhanced styling */}
    <line 
      x1="30" 
      y1="45" 
      x2="40" 
      y2="60" 
      stroke={`url(#stick-gradient-${color})`}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      filter={`url(#stick-glow-${color})`}
    />
    
    {/* Joint dots for modern touch */}
    <circle cx="30" cy="28" r="1.5" fill={color} opacity="0.6"/> {/* Shoulder */}
    <circle cx="30" cy="45" r="1.5" fill={color} opacity="0.6"/> {/* Hip */}
    <circle cx="20" cy="35" r="1" fill={color} opacity="0.5"/> {/* Left hand */}
    <circle cx="40" cy="35" r="1" fill={color} opacity="0.5"/> {/* Right hand */}
    <circle cx="20" cy="60" r="1" fill={color} opacity="0.5"/> {/* Left foot */}
    <circle cx="40" cy="60" r="1" fill={color} opacity="0.5"/> {/* Right foot */}
    
    {/* Simple face elements */}
    <g opacity="0.7">
      <circle cx="27" cy="10" r="0.8" fill={color}/>  {/* Left eye */}
      <circle cx="33" cy="10" r="0.8" fill={color}/>  {/* Right eye */}
      <path 
        d="M27 14 Q30 16 33 14" 
        fill="none" 
        stroke={color} 
        strokeWidth="1"
        strokeLinecap="round"
      />  {/* Smile */}
    </g>
    
    {/* Connection indicators */}
    <circle cx="5" cy="36" r="1.5" fill={color} opacity="0.3"/>
    <circle cx="55" cy="36" r="1.5" fill={color} opacity="0.3"/>
  </svg>
);

// Enhanced diamond shape for Route/Decision nodes with detailed routing visual
const EnhancedDiamond = ({ color = 'red', size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" className="mx-auto">
    {/* Main diamond shape with gradient */}
    <defs>
      <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.7 }} />
      </linearGradient>
      <filter id={`shadow-${color}`}>
        <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3"/>
      </filter>
    </defs>
    
    {/* Diamond background with gradient and shadow */}
    <path 
      d="M40 5 L75 40 L40 75 L5 40 Z" 
      fill={`url(#gradient-${color})`}
      stroke={color} 
      strokeWidth="2"
      filter={`url(#shadow-${color})`}
    />
    
    {/* Inner diamond for depth */}
    <path 
      d="M40 15 L65 40 L40 65 L15 40 Z" 
      fill="none" 
      stroke="white" 
      strokeWidth="1.5"
      opacity="0.4"
    />
    
    {/* Question mark symbol */}
    <g transform="translate(40, 40)">
      <circle r="12" fill="white" opacity="0.9"/>
      <text 
        x="0" 
        y="6" 
        fill={color} 
        fontSize="18" 
        fontWeight="bold" 
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
      >
        ?
      </text>
    </g>
    
    {/* Route direction indicators */}
    {/* Top arrow */}
    <g transform="translate(40, 12)">
      <path d="M-3,-2 L0,-5 L3,-2" fill="white" opacity="0.8"/>
      <line x1="0" y1="-2" x2="0" y2="3" stroke="white" strokeWidth="1.5" opacity="0.8"/>
    </g>
    
    {/* Right arrow */}
    <g transform="translate(68, 40)">
      <path d="M2,-3 L5,0 L2,3" fill="white" opacity="0.8"/>
      <line x1="-3" y1="0" x2="2" y2="0" stroke="white" strokeWidth="1.5" opacity="0.8"/>
    </g>
    
    {/* Bottom arrow */}
    <g transform="translate(40, 68)">
      <path d="M-3,2 L0,5 L3,2" fill="white" opacity="0.8"/>
      <line x1="0" y1="-3" x2="0" y2="2" stroke="white" strokeWidth="1.5" opacity="0.8"/>
    </g>
    
    {/* Left arrow */}
    <g transform="translate(12, 40)">
      <path d="M-2,-3 L-5,0 L-2,3" fill="white" opacity="0.8"/>
      <line x1="3" y1="0" x2="-2" y2="0" stroke="white" strokeWidth="1.5" opacity="0.8"/>
    </g>
    
    {/* Corner decorative dots */}
    <circle cx="40" cy="8" r="1.5" fill="white" opacity="0.7"/>
    <circle cx="72" cy="40" r="1.5" fill="white" opacity="0.7"/>
    <circle cx="40" cy="72" r="1.5" fill="white" opacity="0.7"/>
    <circle cx="8" cy="40" r="1.5" fill="white" opacity="0.7"/>
  </svg>
);

// Login form icon for Login nodes
const LoginForm = ({ color = '#10B981', size = 60 }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 60 48" className="mx-auto">
    {/* Form background */}
    <rect 
      x="5" 
      y="5" 
      width="50" 
      height="38" 
      fill="white" 
      stroke={color} 
      strokeWidth="2"
      rx="4"
    />
    {/* Username field */}
    <rect 
      x="10" 
      y="12" 
      width="40" 
      height="6" 
      fill={color} 
      opacity="0.3"
      rx="1"
    />
    {/* Password field */}
    <rect 
      x="10" 
      y="22" 
      width="40" 
      height="6" 
      fill={color} 
      opacity="0.3"
      rx="1"
    />
    {/* Login button */}
    <rect 
      x="15" 
      y="32" 
      width="30" 
      height="6" 
      fill={color}
      rx="2"
    />
    {/* User icon */}
    <circle 
      cx="15" 
      cy="15" 
      r="2" 
      fill={color}
    />
    {/* Lock icon */}
    <rect 
      x="13" 
      y="24" 
      width="4" 
      height="2" 
      fill={color}
    />
    <path 
      d="M14 24 C14 22.5 15 22 15 22 C15 22 16 22.5 16 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1"
    />
  </svg>
);

// Page layout component icon for page nodes
const PageLayout = ({ color = '#10B981', size = 60 }) => (
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
      rx="3"
    />
    
    {/* Header */}
    <rect 
      x="2" 
      y="2" 
      width="56" 
      height="8" 
      fill={color} 
      rx="3"
    />
    
    {/* Logo/Brand area */}
    <rect 
      x="5" 
      y="4" 
      width="8" 
      height="4" 
      fill="white" 
      opacity="0.9"
      rx="1"
    />
    
    {/* Navigation menu items */}
    <rect x="18" y="5" width="6" height="2" fill="white" opacity="0.8" rx="1"/>
    <rect x="26" y="5" width="6" height="2" fill="white" opacity="0.8" rx="1"/>
    <rect x="34" y="5" width="6" height="2" fill="white" opacity="0.8" rx="1"/>
    
    {/* User menu */}
    <circle cx="52" cy="6" r="2" fill="white" opacity="0.8"/>
    
    {/* Sidebar */}
    <rect 
      x="2" 
      y="10" 
      width="12" 
      height="32" 
      fill={color} 
      opacity="0.1"
      rx="0"
    />
    
    {/* Sidebar menu items */}
    <rect x="4" y="12" width="8" height="2" fill={color} opacity="0.6" rx="1"/>
    <rect x="4" y="16" width="6" height="2" fill={color} opacity="0.4" rx="1"/>
    <rect x="4" y="20" width="7" height="2" fill={color} opacity="0.4" rx="1"/>
    <rect x="4" y="24" width="5" height="2" fill={color} opacity="0.4" rx="1"/>
    <rect x="4" y="28" width="8" height="2" fill={color} opacity="0.4" rx="1"/>
    
    {/* Sidebar icons */}
    <circle cx="5.5" cy="13" r="0.8" fill={color} opacity="0.8"/>
    <rect x="5" y="16.5" width="1" height="1" fill={color} opacity="0.6" rx="0.2"/>
    <circle cx="5.5" cy="21" r="0.8" fill={color} opacity="0.6"/>
    <rect x="5" y="24.5" width="1" height="1" fill={color} opacity="0.6" rx="0.2"/>
    <circle cx="5.5" cy="29" r="0.8" fill={color} opacity="0.6"/>
    
    {/* Main content area */}
    <rect 
      x="16" 
      y="12" 
      width="40" 
      height="26" 
      fill="white" 
      stroke={color} 
      strokeWidth="1" 
      strokeOpacity="0.2"
      rx="2"
    />
    
    {/* Content blocks */}
    <rect x="18" y="14" width="36" height="3" fill={color} opacity="0.3" rx="1"/>
    <rect x="18" y="19" width="28" height="2" fill={color} opacity="0.2" rx="1"/>
    <rect x="18" y="23" width="32" height="2" fill={color} opacity="0.2" rx="1"/>
    
    {/* Content widgets/cards */}
    <rect x="18" y="27" width="16" height="8" fill={color} opacity="0.1" rx="1"/>
    <rect x="36" y="27" width="18" height="8" fill={color} opacity="0.1" rx="1"/>
    
    {/* Widget content */}
    <rect x="19" y="28" width="12" height="1.5" fill={color} opacity="0.4" rx="0.5"/>
    <rect x="19" y="30" width="8" height="1" fill={color} opacity="0.3" rx="0.5"/>
    <rect x="19" y="32" width="10" height="1" fill={color} opacity="0.3" rx="0.5"/>
    
    <rect x="37" y="28" width="14" height="1.5" fill={color} opacity="0.4" rx="0.5"/>
    <rect x="37" y="30" width="10" height="1" fill={color} opacity="0.3" rx="0.5"/>
    <rect x="37" y="32" width="12" height="1" fill={color} opacity="0.3" rx="0.5"/>
    
    {/* Footer */}
    <rect 
      x="2" 
      y="42" 
      width="56" 
      height="4" 
      fill={color} 
      opacity="0.2"
      rx="0"
    />
    
    {/* Footer content */}
    <rect x="5" y="43.5" width="8" height="1" fill={color} opacity="0.6" rx="0.5"/>
    <rect x="48" y="43.5" width="8" height="1" fill={color} opacity="0.6" rx="0.5"/>
  </svg>
);

// Custom Node Component with different shapes based on node type
const CustomNode = ({ data, id }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      finishEditing();
    }
  };

  const finishEditing = () => {
    setIsEditing(false);
    if (label.trim() && label !== data.label) {
      // Update node data through a custom event that parent can listen to
      const updateEvent = new CustomEvent('updateNodeLabel', {
        detail: { nodeId: id, newLabel: label.trim() }
      });
      window.dispatchEvent(updateEvent);
    } else {
      setLabel(data.label || '');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  // Determine node shape based on data.nodeType
  const renderNodeContent = () => {
    const nodeType = data.nodeType || 'default';
    
    switch (nodeType) {
      case 'actor':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <EnhancedStickFigure 
              color={data.style?.strokeColor || data.style?.background || '#3B82F6'} 
              size={60} 
              strokeWidth={3} 
            />
            <div 
              className="mt-1 text-xs font-bold text-center" 
              style={{ color: data.style?.color || '#333' }}
            >
              {renderLabelContent()}
            </div>
          </div>
        );
      
      case 'route':
        return (
          <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
            <EnhancedDiamond color={data.style?.background || 'red'} size={90} />
            <div 
              className="absolute inset-0 flex items-center justify-center text-xs font-bold text-center px-2 mt-12"
              style={{ color: data.style?.color || 'white' }}
            >
              {renderLabelContent()}
            </div>
          </div>
        );
      
      case 'login':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <LoginForm 
              color={data.style?.strokeColor || data.style?.background || '#10B981'} 
              size={100} 
            />
            <div 
              className="mt-1 text-xs font-bold text-center" 
              style={{ color: data.style?.color || '#333' }}
            >
              {renderLabelContent()}
            </div>
          </div>
        );
      
      case 'tabs-component':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <TabsComponent 
              color={data.style?.strokeColor || data.style?.background || '#8B5CF6'} 
              size={100} 
            />
            <div 
              className="mt-1 text-xs font-bold text-center" 
              style={{ color: data.style?.color || '#333' }}
            >
              {renderLabelContent()}
            </div>
          </div>
        );
      
      case 'crud-component':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <CRUDComponent 
              color={data.style?.strokeColor || data.style?.background || '#8B5CF6'} 
              size={100} 
            />
            <div 
              className="mt-1 text-xs font-bold text-center" 
              style={{ color: data.style?.color || '#333' }}
            >
              {renderLabelContent()}
            </div>
          </div>
        );
      
      case 'dashboard-component':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <DashboardComponent 
              color={data.style?.strokeColor || data.style?.background || '#8B5CF6'} 
              size={100} 
            />
            <div 
              className="mt-1 text-xs font-bold text-center" 
              style={{ color: data.style?.color || '#333' }}
            >
              {renderLabelContent()}
            </div>
          </div>
        );
      
      case 'settings-component':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <SettingsComponent 
              color={data.style?.strokeColor || data.style?.background || '#8B5CF6'} 
              size={100} 
            />
            <div 
              className="mt-1 text-xs font-bold text-center" 
              style={{ color: data.style?.color || '#333' }}
            >
              {renderLabelContent()}
            </div>
          </div>
        );
      
      case 'page':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <PageLayout 
              color={data.style?.strokeColor || data.style?.background || '#10B981'} 
              size={100} 
            />
            <div 
              className="mt-1 text-xs font-bold text-center" 
              style={{ color: data.style?.color || '#333' }}
            >
              {renderLabelContent()}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="px-3 py-2 text-center" style={data.style}>
            {renderLabelContent()}
          </div>
        );
    }
  };

  const renderLabelContent = () => (
    <div onDoubleClick={handleDoubleClick} className="min-w-0 relative">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={handleInputChange}
          onBlur={finishEditing}
          onKeyDown={handleKeyDown}
          className="bg-white/20 border border-white/40 rounded px-1 outline-none text-center w-full text-white placeholder-white/70"
          style={{ fontSize: 'inherit', fontWeight: 'inherit' }}
          placeholder="Enter label..."
        />
      ) : (
        <div className="cursor-pointer select-none hover:bg-white/10 rounded px-1 py-0.5 transition-colors" title="Double-click to edit">
          {data.label}
        </div>
      )}
    </div>
  );

  // Get container styles based on node type
  const getContainerStyles = () => {
    const nodeType = data.nodeType || 'default';
    
    switch (nodeType) {
      case 'actor':
        return {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '8px',
        };
      
      case 'route':
        return {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: 0,
        };
      
      case 'login':
        return {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '8px',
        };
      
      case 'tabs-component':
        return {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '8px',
        };
      
      case 'crud-component':
        return {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '8px',
        };
      
      case 'dashboard-component':
        return {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '8px',
        };
      
      case 'settings-component':
        return {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '8px',
        };
      
      case 'page':
        return {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '8px',
        };
      
      default:
        return data.style;
    }
  };

  // Get handle positions based on node type
  const getHandleStyles = () => {
    const nodeType = data.nodeType || 'default';
    
    switch (nodeType) {
      case 'route':
        return {
          left: { left: -8, top: '50%', transform: 'translateY(-50%)', background: '#555' },
          right: { right: -8, top: '50%', transform: 'translateY(-50%)', background: '#555' }
        };
      default:
        return {
          left: { left: -8, background: '#555' },
          right: { right: -8, background: '#555' }
        };
    }
  };

  const handleStyles = getHandleStyles();

  return (
    <div 
      className="relative transition-all duration-200 hover:shadow-lg" 
      style={getContainerStyles()}
    >
      {/* Input handle on left */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={handleStyles.left}
      />
      
      {renderNodeContent()}
      
      {/* Output handle on right */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={handleStyles.right}
      />
    </div>
  );
};

// Initial nodes for the ReactFlow demo
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  customNode: CustomNode,
};

// LocalStorage functions
const FLOW_KEY = 'reactflow-sandbox-data';

const saveFlowToLocalStorage = (nodes: Node[], edges: Edge[]) => {
  try {
    if (typeof window === 'undefined') return;
    
    const flowData = { nodes, edges };
    localStorage.setItem(FLOW_KEY, JSON.stringify(flowData));
    console.log('Saving flow to localStorage:', flowData);
  } catch (error) {
    console.error('Error saving flow to localStorage:', error);
  }
};

const loadFlowFromLocalStorage = () => {
  try {
    if (typeof window === 'undefined') return null;
    
    const savedFlow = localStorage.getItem(FLOW_KEY);
    if (savedFlow) {
      const parsed = JSON.parse(savedFlow);
      // Validate that the saved data has the expected structure
      if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        console.log('Loading saved flow:', parsed);
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading flow from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem(FLOW_KEY);
  }
  return null;
};

const WorkflowWebBuilder: React.FC = () => {

  // State for collapsible groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    'User': false,
    'Page': false,
    'Components': false
  });

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // State for option panel
  const [showOptionPanel, setShowOptionPanel] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['thai', 'english']);
  const [selectedAlertType, setSelectedAlertType] = useState('modal');
  
  // State for template selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // State for fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleOptionPanel = () => {
    setShowOptionPanel(!showOptionPanel);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Close option panel when entering fullscreen
    if (!isFullscreen) {
      setShowOptionPanel(false);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        return prev.filter(lang => lang !== language);
      } else {
        return [...prev, language];
      }
    });
  };

  // Initialize with saved data or defaults
    const getInitialFlow = () => {
      if (typeof window !== 'undefined') {
        const savedFlow = loadFlowFromLocalStorage();
        if (savedFlow && savedFlow.nodes && savedFlow.edges) {
          return savedFlow;
        }
      }
      return { nodes: initialNodes, edges: initialEdges };
    };
  
    const initialFlow = getInitialFlow();
  
    // ReactFlow state
    const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  
    const onConnect = useCallback((params: Connection) => {
      const newEdge = { ...params, markerEnd: { type: MarkerType.ArrowClosed } };
      setEdges((els) => addEdge(newEdge, els));
    }, [setEdges]);
  
    // Handle node label updates
    const updateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
      setNodes((nds) => 
        nds.map((node) => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, label: newLabel } }
            : node
        )
      );
    }, [setNodes]);

    // Function to apply template
    const applyTemplate = useCallback((templateId: string) => {
      if (!templateId) return;
  
      const { nodes: newNodes, edges: newEdges } = createNodesFromTemplate(templateId);
      
      // Apply the new nodes and edges
      setNodes(newNodes);
      setEdges(newEdges);
    }, [setNodes, setEdges]);

    // Template selection handler
    const handleTemplateChange = useCallback((templateId: string) => {
      setSelectedTemplate(templateId);
      if (templateId) {
        applyTemplate(templateId);
      }
    }, [applyTemplate]);
  
    // Listen for node label update events
    useEffect(() => {
      const handleUpdateNodeLabel = (e: CustomEvent) => {
        const { nodeId, newLabel } = e.detail;
        updateNodeLabel(nodeId, newLabel);
      };
  
      window.addEventListener('updateNodeLabel', handleUpdateNodeLabel as EventListener);
      
      return () => {
        window.removeEventListener('updateNodeLabel', handleUpdateNodeLabel as EventListener);
      };
    }, [updateNodeLabel]);
  
    // Save flow data whenever nodes or edges change
    useEffect(() => {
      saveFlowToLocalStorage(nodes, edges);
    }, [nodes, edges]);

    // Handle ESC key to exit fullscreen
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isFullscreen) {
          setIsFullscreen(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isFullscreen]);


  // Drag and drop functionality
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Initialize nodeId based on existing nodes
  const getInitialNodeId = () => {
    let maxId = 0;
    nodes.forEach(node => {
      if (node.id.startsWith('dndnode_')) {
        const id = parseInt(node.id.replace('dndnode_', ''));
        if (!isNaN(id) && id >= maxId) {
          maxId = id + 1;
        }
      }
    });
    return maxId;
  };

  const nodeIdRef = useRef(getInitialNodeId());
  const getId = () => {
    const newId = `dndnode_${nodeIdRef.current}`;
    nodeIdRef.current += 1;
    return newId;
  };

    const onDragOver = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);
  
    const onDrop = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault();
  
        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');
  
        // Check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }
  
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
  
        const nodeData = JSON.parse(event.dataTransfer.getData('application/nodedata'));
        
        const newNode = {
          id: getId(),
          type: 'customNode',
          position,
          data: { 
            label: nodeData.label,
            nodeType: nodeData.nodeType || 'default',
            style: nodeData.style 
          },
        };
  
        setNodes((nds) => nds.concat(newNode));
      },
      [reactFlowInstance, setNodes]
    );
  
    const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData));
      event.dataTransfer.effectAllowed = 'move';
    };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900" : ""}>
      <section id="sandbox" className={isFullscreen ? "w-full h-full" : "py-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden"}>
        {!isFullscreen && <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>}
        
        <div className={isFullscreen ? "w-full h-full relative" : "max-w-7xl mx-auto px-4 relative"}>
          {!isFullscreen && (
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Sandbox - 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> (Web Builder Workflow)</span>
              </h2>
            </div>
          )}

          {/* Interactive Sandbox Preview */}
          <div className={isFullscreen 
            ? "w-full h-full" 
            : "bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/20 p-8 shadow-2xl"
          }>
            {/* Mock Sandbox Interface */}
            <div className={isFullscreen 
              ? "w-full h-full relative" 
              : "bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-96 relative overflow-hidden"
            }>
              {!isFullscreen && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>}
              
              {/* Draggable Components Palette */}
              <div className={isFullscreen 
                ? "absolute top-4 left-4 bottom-4 w-56 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-y-auto" 
                : "absolute top-4 left-4 bottom-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-y-auto"
              }>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Web Tools</h4>
                  {isFullscreen && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">ESC to exit</span>
                  )}
                </div>

                {/* Template Selection Dropdown */}
                <TemplateSelector 
                  selectedTemplate={selectedTemplate}
                  onTemplateChange={handleTemplateChange}
                />

                <div className="space-y-3">
                  
                  {/* User Group */}
                  <div>
                    <button 
                      onClick={() => toggleGroup('User')}
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        User
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${collapsedGroups['User'] ? 'rotate-0' : 'rotate-90'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {!collapsedGroups['User'] && (
                      <div className="mt-2 ml-5 space-y-2">
                        {/* Actor - Public User Nodes */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'user', {
                            label: 'User',
                            nodeType: 'actor',
                            style: {
                              background: 'transparent',
                              strokeColor: '#FFFAFA',
                              color: '#FFFAFA',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">User</span>
                        </div>

                        {/* Actor - Login User Nodes */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'user', {
                            label: 'User-Login',
                            nodeType: 'actor',
                            style: {
                              background: 'transparent',
                              strokeColor: 'green',
                              color: '#FFFAFA',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">User-Login</span>
                        </div>

                        {/* Actor - Admin User Nodes */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'user', {
                            label: 'User-Admin',
                            nodeType: 'actor',
                            style: {
                              background: 'transparent',
                              strokeColor: 'brown',
                              color: '#FFFAFA',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-amber-600 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">User-Admin</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Page Group */}
                  <div>
                    <button 
                      onClick={() => toggleGroup('Page')}
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        Page
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${collapsedGroups['Page'] ? 'rotate-0' : 'rotate-90'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {!collapsedGroups['Page'] && (
                      <div className="mt-2 ml-5 space-y-2">
                        {/* Login Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'login', {
                            label: 'Login',
                            nodeType: 'login',
                            style: {
                              background: '#10B981',
                              color: 'white',
                              border: '2px solid #047857',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">Login</span>
                        </div>

                        {/* Landing Page Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'page', {
                            label: 'Landing',
                            nodeType: 'page',
                            style: {
                              background: '#10B981',
                              color: 'white',
                              border: '2px solid #047857',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">Landing-Page</span>
                        </div>

                        {/* User Home Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'page', {
                            label: 'Home-User',
                            nodeType: 'page',
                            style: {
                              background: '#10B981',
                              color: 'white',
                              border: '2px solid #047857',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">Home-User</span>
                        </div>

                        {/* Admin Home Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'page', {
                            label: 'Home-Admin',
                            nodeType: 'page',
                            style: {
                              background: '#10B981',
                              color: 'white',
                              border: '2px solid #047857',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">Home-Admin</span>
                        </div>

                        {/* Route Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'route', {
                            label: 'Route?',
                            nodeType: 'route',
                            style: {
                              background: 'red',
                              color: 'white',
                              border: '2px solid darkred',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">Route</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Components Group */}
                  <div>
                    <button 
                      onClick={() => toggleGroup('Components')}
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                        Components
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${collapsedGroups['Components'] ? 'rotate-0' : 'rotate-90'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {!collapsedGroups['Components'] && (
                      <div className="mt-2 ml-5 space-y-2">
                        {/* Components - CRUD Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'page', {
                            label: 'CRUD Component',
                            nodeType: 'crud-component',
                            style: {
                              background: '#8B5CF6',
                              color: 'white',
                              border: '2px solid #6D28D9',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">c-CRUD</span>
                        </div>

                        {/* Components - Tabs Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'page', {
                            label: 'Tabs Component',
                            nodeType: 'tabs-component',
                            style: {
                              background: '#8B5CF6',
                              color: 'white',
                              border: '2px solid #6D28D9',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">c-Tabs</span>
                        </div>

                        {/* Components - Dashboard Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'page', {
                            label: 'Dashboard Component',
                            nodeType: 'dashboard-component',
                            style: {
                              background: '#8B5CF6',
                              color: 'white',
                              border: '2px solid #6D28D9',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">c-Dashboard</span>
                        </div>

                        {/* Components - Settings Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'page', {
                            label: 'Settings Component',
                            nodeType: 'settings-component',
                            style: {
                              background: '#8B5CF6',
                              color: 'white',
                              border: '2px solid #6D28D9',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">c-Settings</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* ReactFlow Canvas */}
              <div className={isFullscreen ? "ml-64 mr-4 mt-4 mb-4" : "ml-48 mr-4 mt-4"}>
                <div className={isFullscreen 
                  ? "bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden h-full" 
                  : "bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 min-h-80 relative overflow-hidden"
                }>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: isFullscreen ? 'calc(100vh - 8rem)' : '500px' 
                    }}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                  >
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      onInit={setReactFlowInstance}
                      nodeTypes={nodeTypes}
                      fitView
                      nodesDraggable={true}
                      nodesConnectable={true}
                      elementsSelectable={true}
                      minZoom={0.3}
                      maxZoom={2}
                      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                      proOptions={{ hideAttribution: true }}
                    >
                      <Background 
                        variant={BackgroundVariant.Dots} 
                        gap={20} 
                        size={1} 
                        color="#94a3b8"
                      />
                      <Controls 
                        position="bottom-right"
                        showZoom={true}
                        showFitView={true}
                        showInteractive={false}
                      />
                    </ReactFlow>
                  </div>
                  
                  {/* Option Panel Button - Left side */}
                  <div className="absolute top-4 left-4 z-20">
                    <button 
                      onClick={toggleOptionPanel}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 border border-purple-600"
                    >
                      Options
                    </button>
                  </div>

                  {/* Option Panel Overlay */}
                  {showOptionPanel && (
                    <div className="absolute top-16 left-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-200 dark:border-slate-700 z-20 w-80">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Options</h3>
                        <button 
                          onClick={toggleOptionPanel}
                          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Options Panel Content - Single Row */}
                      <div className="flex items-center space-x-4">
                        
                        {/* Theme Selector */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Theme
                          </label>
                          <select 
                            value={selectedTheme} 
                            onChange={(e) => setSelectedTheme(e.target.value)}
                            className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                          >
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="purple">Purple</option>
                            <option value="red">Red</option>
                            <option value="orange">Orange</option>
                          </select>
                        </div>

                        {/* Language Checkboxes */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Languages
                          </label>
                          <div className="space-y-1">
                            {['thai', 'english', 'japanese', 'chinese'].map(lang => (
                              <label key={lang} className="flex items-center text-xs">
                                <input
                                  type="checkbox"
                                  checked={selectedLanguages.includes(lang)}
                                  onChange={() => handleLanguageChange(lang)}
                                  className="mr-1 w-3 h-3"
                                />
                                <span className="capitalize text-slate-700 dark:text-slate-300">{lang}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Alert/Modal Type Selector */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Alert Type
                          </label>
                          <select 
                            value={selectedAlertType} 
                            onChange={(e) => setSelectedAlertType(e.target.value)}
                            className="w-full text-xs border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                          >
                            <option value="modal">Modal</option>
                            <option value="toast">Toast</option>
                            <option value="alert">Alert</option>
                            <option value="notification">Notification</option>
                            <option value="popup">Popup</option>
                          </select>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {/* Fullscreen Toggle Button */}
                    <button 
                      onClick={toggleFullscreen}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 border border-indigo-600 flex items-center space-x-2"
                      title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Exit</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a2 2 0 012-2h4M4 16v4a2 2 0 002 2h4M16 4h4a2 2 0 012 2v4M16 20h4a2 2 0 01-2 2h-4" />
                          </svg>
                          <span>Fullscreen</span>
                        </>
                      )}
                    </button>

                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 border border-green-600">
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkflowWebBuilder;
