import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Star, Check, Menu, X, Search } from 'lucide-react';
import { TEMPLATES, TIER_LIMITS } from '@/lib/constants';
import { useCurrency } from '@/contexts/CurrencyContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import VideoModal from '@/components/VideoModal';
import InteractiveBook from '@/components/ui/InteractiveBook';
import { useTranslation } from 'react-i18next';
import { useScrollToSection } from '@/hooks/useScrollToSection';
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
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';

interface LandingPageProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

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
      case 'user':
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
      
      case 'decision':
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
      case 'user':
        return {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: '8px',
        };
      
      case 'decision':
        return {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: 0,
        };
      
      default:
        return data.style;
    }
  };

  // Get handle positions based on node type
  const getHandleStyles = () => {
    const nodeType = data.nodeType || 'default';
    
    switch (nodeType) {
      case 'decision':
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
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' }
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

const LandingPage: React.FC<LandingPageProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const router = useRouter();
  const { getPricing } = useCurrency();
  const { t } = useTranslation();
  const { activeSection, scrollToSection } = useScrollToSection();
  const pricing = getPricing();
  const [searchQuery, setSearchQuery] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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

  const onConnect = useCallback((params: Connection) => setEdges((els) => addEdge(params, els)), [setEdges]);

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

  // Reset flow to initial state
  const resetFlow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    localStorage.removeItem(FLOW_KEY);
    nodeIdRef.current = 0;
  };
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="border-b border-white/20 dark:border-slate-700/20 bg-white/10 dark:bg-slate-900/10 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection('sandbox')}
                className={`text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition ${
                  activeSection === 'sandbox' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                }`}
              >
                Sandbox
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className={`text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition ${
                  activeSection === 'features' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                }`}
              >
                {t('features')}
              </button>
              <button 
                onClick={() => scrollToSection('templates')}
                className={`text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition ${
                  activeSection === 'templates' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                }`}
              >
                {t('templates')}
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className={`text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition ${
                  activeSection === 'pricing' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                }`}
              >
                {t('pricing')}
              </button>
              <CurrencySwitcher />
              <LanguageSwitcher />
              <button 
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:scale-105"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-4">
              <div className="flex flex-col space-y-4 px-4">
                <button 
                  onClick={() => {
                    scrollToSection('sandbox');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition py-2 ${
                    activeSection === 'sandbox' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  Sandbox
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('features');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition py-2 ${
                    activeSection === 'features' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  {t('features')}
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('templates');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition py-2 ${
                    activeSection === 'templates' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  {t('templates')}
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('pricing');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition py-2 ${
                    activeSection === 'pricing' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  {t('pricing')}
                </button>
                <button 
                  onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition text-center mt-4"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Build Apps <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">10x Faster</span>
            <InteractiveBook className="inline-block ml-4 -mt-2 align-middle" />
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto px-4">
            The AI-powered low-code platform that transforms your ideas into production-ready applications with visual workflows and intelligent automation.
          </p>
          
          {/* Modern Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-2xl">
                <div className="flex items-center px-6 py-4">
                  <Search className="h-6 w-6 text-slate-400 dark:text-slate-500 mr-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates, features, or ask anything..."
                    className="flex-1 text-lg bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
                  />
                  <button className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105 flex items-center space-x-2">
                    <span>Search</span>
                  </button>
                </div>
                {searchQuery && (
                  <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Quick suggestions:</div>
                    <div className="flex flex-wrap gap-2">
                      {['E-commerce', 'CRM', 'Dashboard', 'API Integration'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setSearchQuery(suggestion)}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
            >
              Start Building Free
            </button>
            <button 
              onClick={() => setIsVideoModalOpen(true)}
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-lg font-semibold border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition transform hover:scale-105"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Wow Section - Sandbox */}
      <section id="sandbox" className="py-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Build Your Website in
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 3 Simple Actions</span>
            </h2>
          </div>

          {/* Interactive Sandbox Preview */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/20 p-8 shadow-2xl">
            {/* Mock Sandbox Interface */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-96 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              
              {/* Draggable Components Palette */}
              <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Components</h4>
                <div className="space-y-2">
                  {/* User Nodes */}
                  <div 
                    className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'user', {
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
                    })}
                  >
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">User</span>
                  </div>
                  
                  {/* Page Node */}
                  <div 
                    className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'page', {
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
                    })}
                  >
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Page</span>
                  </div>

                  {/* Decision Node */}
                  <div 
                    className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'decision', {
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
                    })}
                  >
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Decision</span>
                  </div>

                  {/* Services Node */}
                  <div 
                    className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'services', {
                      label: 'Services',
                      nodeType: 'services',
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
                    <span className="text-xs text-slate-600 dark:text-slate-400">Services</span>
                  </div>
                </div>
              </div>

              {/* ReactFlow Canvas */}
              <div className="ml-48 mr-4 mt-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 min-h-80 relative overflow-hidden">
                  <div 
                    style={{ width: '100%', height: '320px' }}
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
                    <button 
                      onClick={resetFlow}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 border border-red-600"
                    >
                      Reset
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">{t('powerfulFeatures')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white/20 dark:bg-slate-800/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/20 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-600/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Code2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{t('visualDevelopment')}</h3>
              <p className="text-slate-600 dark:text-slate-400">{t('visualDevelopmentDesc')}</p>
            </div>
            <div className="text-center p-8 bg-white/20 dark:bg-slate-800/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/20 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-green-600/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{t('aiPowered')}</h3>
              <p className="text-slate-600 dark:text-slate-400">{t('aiPoweredDesc')}</p>
            </div>
            <div className="text-center p-8 bg-white/20 dark:bg-slate-800/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/20 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-purple-600/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Check className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{t('productionReady')}</h3>
              <p className="text-slate-600 dark:text-slate-400">{t('productionReadyDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Start with Production-Ready Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map(template => (
              <div key={template.id} className="bg-white/25 dark:bg-slate-800/25 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-slate-700/20 hover:bg-white/35 dark:hover:bg-slate-800/35 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="text-4xl mb-4">{template.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{template.name}</h3>
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded text-sm mb-3">
                  {template.category}
                </span>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{template.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{template.stars}</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-500">{template.uses} uses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
          
          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-1 flex items-center">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Annual</span>
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {['Junior', 'Senior', 'Specialist'].map((tier, index) => (
              <div key={tier} className={`bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 dark:border-slate-700/20 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-300 hover:shadow-2xl ${index === 1 ? 'ring-2 ring-blue-500/50 transform scale-105 bg-white/40 dark:bg-slate-800/40' : ''}`}>
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{tier}</h3>
                <div className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                  {tier === 'Junior' ? (
                    'Free'
                  ) : (() => {
                    const tierPricing = pricing[tier as keyof typeof pricing];
                    const monthlyPrice = parseInt(tierPricing?.monthly?.replace(/[^0-9]/g, '') || '0');
                    
                    return billingCycle === 'yearly' ? (
                      <>
                        ${Math.round(monthlyPrice * 12 * 0.8)}/year
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                          ${Math.round(monthlyPrice * 0.8)}/month billed annually
                        </div>
                      </>
                    ) : (
                      `$${monthlyPrice}/month`
                    );
                  })()}
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {TIER_LIMITS[tier].projects} {tier === 'Specialist' ? 'Unlimited' : ''} Projects
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {TIER_LIMITS[tier].exports} Exports/month
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {TIER_LIMITS[tier].nodes} Nodes per flow
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {TIER_LIMITS[tier].support} Support
                  </li>
                </ul>
                <button 
                  onClick={() => {
                    if (tier === 'Junior') {
                      router.push('/login');
                    } else {
                      // Redirect to login first, then user can upgrade from dashboard
                      router.push('/login');
                    }
                  }}
                  className={`w-full py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
                    index === 1 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tier === 'Junior' ? 'Start Free' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />

      {/* Video Modal */}
      <VideoModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title="TON Low-Code Platform Demo"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with actual demo video
      />
    </div>
  );
};

export default LandingPage;