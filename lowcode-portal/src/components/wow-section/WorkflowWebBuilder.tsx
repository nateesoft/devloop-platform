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

// Stick Figure SVG Component for User nodes
const StickFigure = ({ color = '#3B82F6', size = 60, strokeWidth = 3 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 60 72" className="mx-auto">
    {/* Head */}
    <circle 
      cx="30" 
      cy="12" 
      r="8" 
      fill="none" 
      stroke={color} 
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Body */}
    <line 
      x1="30" 
      y1="20" 
      x2="30" 
      y2="45" 
      stroke={color} 
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Arms */}
    <line 
      x1="30" 
      y1="28" 
      x2="20" 
      y2="35" 
      stroke={color} 
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line 
      x1="30" 
      y1="28" 
      x2="40" 
      y2="35" 
      stroke={color} 
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Legs */}
    <line 
      x1="30" 
      y1="45" 
      x2="20" 
      y2="60" 
      stroke={color} 
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line 
      x1="30" 
      y1="45" 
      x2="40" 
      y2="60" 
      stroke={color} 
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

// Diamond shape for Decision nodes (แบบ flowchart มาตรฐาน)
const Diamond = ({ color = 'red', size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" className="mx-auto">
    <path 
      d="M40 5 L75 40 L40 75 L5 40 Z" 
      fill={color} 
      stroke={color} 
      strokeWidth="2"
    />
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
            <StickFigure 
              color={data.style?.strokeColor || data.style?.background || '#3B82F6'} 
              size={50} 
              strokeWidth={4} 
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
            <Diamond color={data.style?.background || 'red'} size={90} />
            <div 
              className="absolute inset-0 flex items-center justify-center text-xs font-bold text-center px-2"
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
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'customNode',
    position: { x: 50, y: 50 },
    data: { 
      label: 'User',
      nodeType: 'user',
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
    }
  },
  {
    id: '2',
    type: 'customNode',
    position: { x: 250, y: 20 },
    data: { 
      label: 'Page',
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
    }
  },
  {
    id: '3',
    type: 'customNode',
    position: { x: 250, y: 100 },
    data: { 
      label: 'Decision?',
      nodeType: 'decision',
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
    }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }
];

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
    <section id="sandbox" className="py-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Sandbox - 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> (Web Builder Workflow)</span>
            </h2>
          </div>

          {/* Interactive Sandbox Preview */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/20 p-8 shadow-2xl">
            {/* Mock Sandbox Interface */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-96 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              
              {/* Draggable Components Palette */}
              <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Tools</h4>
                <div className="space-y-2">
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
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
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
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">User-Admin</span>
                  </div>
                  
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

                  {/* Components - CRUD Node */}
                  <div 
                    className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'page', {
                      label: 'CRUD Component',
                      nodeType: 'component',
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

                  {/* Components - Dasbhoard Node */}
                  <div 
                    className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'page', {
                      label: 'Dashboard Component',
                      nodeType: 'component',
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
                      nodeType: 'component',
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
              </div>

              {/* ReactFlow Canvas */}
              <div className="ml-48 mr-4 mt-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 min-h-80 relative overflow-hidden">
                  <div 
                    style={{ width: '100%', height: '500px' }}
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
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
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
  );
};

export default WorkflowWebBuilder;
