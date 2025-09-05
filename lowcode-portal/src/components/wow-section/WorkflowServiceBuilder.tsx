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
  MarkerType,
  EdgeProps,
  getBezierPath,
  BaseEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

// Add CSS for drag over effect and group styling
const groupNodeStyles = `
  .group-node-container.drag-over {
    background-color: rgba(251, 146, 60, 0.2) !important;
    border-color: #f97316 !important;
    box-shadow: 0 0 20px rgba(251, 146, 60, 0.5) !important;
  }
  
  /* Group nodes should have low z-index to be behind other nodes */
  .react-flow__node[data-nodetype="group"] {
    z-index: 1 !important;
  }
  
  /* Regular nodes should have higher z-index */
  .react-flow__node:not([data-nodetype="group"]) {
    z-index: 10 !important;
  }
  
  /* Nodes in groups should have even higher z-index and be clickable */
  .react-flow__node.node-in-group {
    z-index: 100 !important;
    pointer-events: auto !important;
  }
  
  /* Group node content should allow drag but not block child nodes */
  .group-node-container {
    pointer-events: auto !important;
  }
  
  .group-node-container > div:not([style*="pointer-events: auto"]) {
    pointer-events: none !important;
  }
  
  /* But allow pointer events on specific group elements */
  .group-node-container button {
    pointer-events: auto !important;
  }
  
  .group-node-container input {
    pointer-events: auto !important;
  }
  
  /* Ensure nodes in groups are fully interactive */
  .node-in-group * {
    pointer-events: auto !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = groupNodeStyles;
  document.head.appendChild(styleSheet);
}

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

  // Handle group resize with +/- buttons
  const handleGroupResize = useCallback((nodeId: string, action: 'expand' | 'shrink') => {
    const resizeEvent = new CustomEvent('groupResize', {
      detail: { nodeId, action }
    });
    window.dispatchEvent(resizeEvent);
  }, []);

  // Determine node shape based on data.nodeType
  const renderNodeContent = () => {
    const nodeType = data.nodeType || 'default';
    
    if (nodeType === 'group') {
      return (
        <div 
          className="relative p-4 text-center flex flex-col items-center justify-center w-full h-full group-node-container" 
          style={data.style}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Drop event on group node:', id);
            
            // Dispatch custom event to parent component
            const dropEvent = new CustomEvent('nodeDropOnGroup', {
              detail: { 
                groupId: id, 
                dropX: e.clientX, 
                dropY: e.clientY,
                originalEvent: e 
              }
            });
            window.dispatchEvent(dropEvent);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as EventTarget)) {
              e.currentTarget.classList.remove('drag-over');
            }
          }}
        >
          <div className="absolute top-2 left-2 text-xs opacity-70 pointer-events-none">
            {renderLabelContent()}
          </div>
          <div className="absolute bottom-2 left-2 text-xs opacity-50 pointer-events-none">
            {data.style?.width || 200} x {data.style?.height || 150}
          </div>
          <div className="flex-1 flex items-center justify-center text-sm opacity-50 pointer-events-none">
            Drop nodes here
          </div>
        </div>
      );
    }
    
    return (
      <div className="px-3 py-2 text-center" style={data.style}>
        {renderLabelContent()}
      </div>
    );
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
    return data.style;
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
      case 'group':
        return {
          left: { left: -8, top: '20px', background: '#F97316' },
          right: { right: -8, top: '20px', background: '#F97316' },
          bottom: { bottom: -8, left: '50%', transform: 'translateX(-50%)', background: '#F97316' }
        };
      default:
        return {
          left: { left: -8, background: '#555' },
          right: { right: -8, background: '#555' }
        };
    }
  };

  const handleStyles = getHandleStyles();
  const nodeType = data.nodeType || 'default';

  const nodeStyle = getContainerStyles();
  const isInGroup = data.isInGroup;
  const combinedStyle = isInGroup 
    ? { 
        ...nodeStyle, 
        border: '2px solid #f97316', 
        boxShadow: '0 0 10px rgba(251, 146, 60, 0.3)',
        zIndex: 100  // Ensure nodes in group are visible
      }
    : nodeStyle;

  return (
    <div 
      className={`relative transition-all duration-200 hover:shadow-lg ${isInGroup ? 'node-in-group' : ''}`}
      style={combinedStyle}
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

      {/* Additional bottom handle for group nodes */}
      {nodeType === 'group' && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-output"
          style={handleStyles.bottom}
        />
      )}

      {/* Resize buttons for group nodes */}
      {nodeType === 'group' && (
        <div className="absolute top-2 right-2 flex space-x-1 z-50" style={{pointerEvents: 'auto'}}>
          {/* Expand button (+) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGroupResize(id, 'expand');
            }}
            className="w-6 h-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 hover:scale-110"
            title="Expand group"
            style={{pointerEvents: 'auto'}}
          >
            +
          </button>
          
          {/* Shrink button (-) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGroupResize(id, 'shrink');
            }}
            className="w-6 h-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 hover:scale-110"
            title="Shrink group"
            style={{pointerEvents: 'auto'}}
          >
            -
          </button>
        </div>
      )}
    </div>
  );
};

// Custom Edge Component with editable labels
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      finishEditing();
    }
  };

  const finishEditing = () => {
    setIsEditing(false);
    if (label.trim() && label !== data?.label) {
      // Update edge data through a custom event that parent can listen to
      const updateEvent = new CustomEvent('updateEdgeLabel', {
        detail: { edgeId: id, newLabel: label.trim() }
      });
      window.dispatchEvent(updateEvent);
    } else {
      setLabel(data?.label || '');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={MarkerType.ArrowClosed} />
      <foreignObject
        width={120}
        height={40}
        x={labelX - 60}
        y={labelY - 20}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex items-center justify-center w-full h-full">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={label}
              onChange={handleInputChange}
              onBlur={finishEditing}
              onKeyDown={handleKeyDown}
              className="bg-white border border-blue-300 rounded px-2 py-1 text-xs text-center shadow-sm min-w-20 max-w-28"
              placeholder="Label..."
            />
          ) : (
            <div
              onDoubleClick={handleDoubleClick}
              className="bg-white/90 backdrop-blur-sm border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-700 cursor-pointer hover:bg-white shadow-sm transition-all duration-200 hover:border-blue-400"
              title="Double-click to edit"
            >
              {data?.label || 'Click to add label'}
            </div>
          )}
        </div>
      </foreignObject>
    </>
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
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    type: 'customEdge', 
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { label: 'access' }
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3', 
    type: 'customEdge', 
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { label: 'navigate' }
  }
];

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

// LocalStorage functions
const FLOW_KEY = 'reactflow-sandbox-service-data';

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

const WorkflowServiceBuilder: React.FC = () => {

  // State for collapsible groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    'Input': false,
    'Process': false,
    'Output': false,
    'Group Service': false
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

  const toggleOptionPanel = () => {
    setShowOptionPanel(!showOptionPanel);
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
    const [nodes, setNodes, originalOnNodesChange] = useNodesState(initialFlow.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
    
    // Store previous node positions for delta calculation
    const previousPositionsRef = useRef<Record<string, { x: number, y: number }>>({});

    // Custom onNodesChange to handle group movement
    const onNodesChange = useCallback((changes: any[]) => {
      // Apply the original changes first
      originalOnNodesChange(changes);
      
      // Handle group movement
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          const movedNode = nodes.find(n => n.id === change.id);
          
          if (movedNode?.data?.nodeType === 'group') {
            const prevPosition = previousPositionsRef.current[change.id];
            
            if (prevPosition) {
              const deltaX = change.position.x - prevPosition.x;
              const deltaY = change.position.y - prevPosition.y;
              
              // Move all nodes in this group
              const nodesInGroup = nodes.filter(n => n.data?.groupId === change.id);
              
              if (nodesInGroup.length > 0 && (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1)) {
                console.log(`Moving ${nodesInGroup.length} nodes with group ${change.id} by ${deltaX}, ${deltaY}`);
                
                setNodes((nds) =>
                  nds.map((n) => {
                    if (n.data?.groupId === change.id) {
                      return {
                        ...n,
                        position: {
                          x: n.position.x + deltaX,
                          y: n.position.y + deltaY
                        }
                      };
                    }
                    return n;
                  })
                );
              }
            }
            
            // Update previous position
            previousPositionsRef.current[change.id] = { ...change.position };
          } else {
            // Update previous position for non-group nodes too
            previousPositionsRef.current[change.id] = { ...change.position };
          }
        }
      });
    }, [originalOnNodesChange, nodes, setNodes]);
    
    // Drag and drop functionality
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
    const onConnect = useCallback((params: Connection) => {
      const newEdge = { 
        ...params, 
        type: 'customEdge',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: '' }
      };
      setEdges((els) => addEdge(newEdge, els));
    }, [setEdges]);

    // Handle node drag to show visual feedback  
    const onNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
      // Find if the node is over a group node
      const elementsBelow = document.elementsFromPoint(event.clientX, event.clientY);
      const groupContainer = elementsBelow.find(el => el.classList.contains('group-node-container'));
      
      // Remove drag-over class from all group containers
      document.querySelectorAll('.group-node-container').forEach(container => {
        container.classList.remove('drag-over');
      });
      
      // Add drag-over class to the current group container if hovering
      if (groupContainer) {
        const nodeElement = groupContainer.closest('.react-flow__node');
        if (nodeElement) {
          const groupId = nodeElement.getAttribute('data-id');
          if (groupId && groupId !== node.id) {
            groupContainer.classList.add('drag-over');
          }
        }
      }
    }, []);

    // Handle node drag stop to check if dropped on group
    const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
      // Remove all drag-over classes
      document.querySelectorAll('.group-node-container').forEach(container => {
        container.classList.remove('drag-over');
      });

      if (!reactFlowInstance) return;

      // If it's a group node that was moved, move all nodes in that group
      if (node.data?.nodeType === 'group') {
        const nodesInGroup = nodes.filter(n => n.data?.groupId === node.id);
        
        if (nodesInGroup.length > 0) {
          console.log(`Moving ${nodesInGroup.length} nodes with group ${node.id}`);
          
          // We don't need to do anything here because nodes will automatically
          // move with their absolute positions when we update them in onNodeDrag
        }
        return;
      }

      // Find if the node is over a group node
      const elementsBelow = document.elementsFromPoint(event.clientX, event.clientY);
      const groupContainer = elementsBelow.find(el => el.classList.contains('group-node-container'));
      
      if (groupContainer) {
        // Find the group node ID from the container's parent node
        const nodeElement = groupContainer.closest('.react-flow__node');
        if (nodeElement) {
          const groupId = nodeElement.getAttribute('data-id');
          
          if (groupId && groupId !== node.id) {
            console.log(`Dropping node ${node.id} on group ${groupId}`);
            
            // Find the group node
            const groupNode = nodes.find(n => n.id === groupId);
            if (groupNode) {
              // Calculate relative position within the group (with padding)
              const relativeX = Math.max(10, node.position.x - groupNode.position.x);
              const relativeY = Math.max(10, node.position.y - groupNode.position.y);
              
              console.log('Group node found:', groupNode);
              console.log('Node position:', node.position);
              console.log('Group position:', groupNode.position);
              console.log('Relative position:', { x: relativeX, y: relativeY });
              
              setNodes((nds) => {
                const updatedNodes = nds.map((n) => 
                  n.id === node.id 
                    ? {
                        ...n,
                        // Keep absolute position for now to test visibility
                        position: { x: node.position.x, y: node.position.y },
                        data: {
                          ...n.data,
                          // Store group information in data instead
                          groupId: groupId,
                          isInGroup: true
                        }
                      }
                    : n
                );
                console.log('Updated nodes after grouping:', updatedNodes);
                console.log('Target node after update:', updatedNodes.find(n => n.id === node.id));
                
                // Force DOM update for z-index classes
                setTimeout(() => {
                  const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
                  if (nodeElement) {
                    nodeElement.classList.add('node-in-group');
                    console.log('Added node-in-group class to:', nodeElement);
                  }
                }, 50);
                
                return updatedNodes;
              });
            }
          }
        }
      } else if (node.data?.isInGroup) {
        // Node was dragged outside of its parent group - ungroup it
        console.log(`Ungrouping node ${node.id} from group ${node.data.groupId}`);
        
        setNodes((nds) => {
          const updatedNodes = nds.map((n) => 
            n.id === node.id 
              ? {
                  ...n,
                  position: { x: node.position.x, y: node.position.y },
                  data: {
                    ...n.data,
                    groupId: undefined,
                    isInGroup: false
                  }
                }
              : n
          );
          
          // Force DOM update for z-index classes
          setTimeout(() => {
            const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
            if (nodeElement) {
              nodeElement.classList.remove('node-in-group');
              console.log('Removed node-in-group class from:', nodeElement);
            }
          }, 50);
          
          return updatedNodes;
        });
      }
    }, [reactFlowInstance, nodes, setNodes]);
  
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

    // Handle edge label updates
    const updateEdgeLabel = useCallback((edgeId: string, newLabel: string) => {
      setEdges((eds) => 
        eds.map((edge) => 
          edge.id === edgeId 
            ? { ...edge, data: { ...edge.data, label: newLabel } }
            : edge
        )
      );
    }, [setEdges]);

    // Handle group resize
    const handleGroupResize = useCallback((nodeId: string, action: 'expand' | 'shrink') => {
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === nodeId && node.data.nodeType === 'group') {
            const currentWidth = node.data.style?.width || 200;
            const currentHeight = node.data.style?.height || 150;
            
            const step = 50; // Resize step in pixels
            let newWidth = currentWidth;
            let newHeight = currentHeight;
            
            if (action === 'expand') {
              newWidth = currentWidth + step;
              newHeight = currentHeight + step;
            } else if (action === 'shrink') {
              newWidth = Math.max(150, currentWidth - step); // Min width 150px
              newHeight = Math.max(100, currentHeight - step); // Min height 100px
            }
            
            return {
              ...node,
              data: {
                ...node.data,
                style: {
                  ...node.data.style,
                  width: newWidth,
                  height: newHeight
                }
              }
            };
          }
          return node;
        })
      );
    }, [setNodes]);

  
    // Handle node drop on group
    const handleNodeDropOnGroup = useCallback((groupId: string, droppedNodeId: string, position: { x: number, y: number }) => {
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === droppedNodeId) {
            // Find the group node to get its position
            const groupNode = nds.find(n => n.id === groupId);
            if (groupNode) {
              // Calculate relative position within the group
              const relativeX = position.x - groupNode.position.x;
              const relativeY = position.y - groupNode.position.y;
              
              return {
                ...node,
                position: { x: relativeX, y: relativeY },
                parentId: groupId,
                extent: 'parent' as const
              };
            }
          }
          return node;
        })
      );
    }, [setNodes]);

    // Listen for node and edge label update events
    useEffect(() => {
      const handleUpdateNodeLabel = (e: CustomEvent) => {
        const { nodeId, newLabel } = e.detail;
        updateNodeLabel(nodeId, newLabel);
      };

      const handleUpdateEdgeLabel = (e: CustomEvent) => {
        const { edgeId, newLabel } = e.detail;
        updateEdgeLabel(edgeId, newLabel);
      };

      const handleNodeDropOnGroupEvent = (e: CustomEvent) => {
        const { groupId, dropX, dropY } = e.detail;
        console.log('Node drop on group event received:', { groupId, dropX, dropY });
        // This will be handled by ReactFlow's onNodeDrag events instead
      };

      const handleGroupResizeEvent = (e: CustomEvent) => {
        const { nodeId, action } = e.detail;
        handleGroupResize(nodeId, action);
      };

  
      window.addEventListener('updateNodeLabel', handleUpdateNodeLabel as EventListener);
      window.addEventListener('updateEdgeLabel', handleUpdateEdgeLabel as EventListener);
      window.addEventListener('nodeDropOnGroup', handleNodeDropOnGroupEvent as EventListener);
      window.addEventListener('groupResize', handleGroupResizeEvent as EventListener);
      
      return () => {
        window.removeEventListener('updateNodeLabel', handleUpdateNodeLabel as EventListener);
        window.removeEventListener('updateEdgeLabel', handleUpdateEdgeLabel as EventListener);
        window.removeEventListener('nodeDropOnGroup', handleNodeDropOnGroupEvent as EventListener);
        window.removeEventListener('groupResize', handleGroupResizeEvent as EventListener);
      };
    }, [updateNodeLabel, updateEdgeLabel, handleGroupResize]);
  
    // Initialize and update node positions tracking
    useEffect(() => {
      nodes.forEach(node => {
        if (!previousPositionsRef.current[node.id]) {
          previousPositionsRef.current[node.id] = { ...node.position };
        }
      });
    }, [nodes]);

    // Save flow data whenever nodes or edges change
    useEffect(() => {
      saveFlowToLocalStorage(nodes, edges);
      
      // Debug: log nodes in groups
      const groupedNodes = nodes.filter(n => n.data?.isInGroup);
      if (groupedNodes.length > 0) {
        console.log('Current nodes in groups:', groupedNodes);
      }
      console.log('All nodes:', nodes);
    }, [nodes, edges]);


  
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
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> (Service Builder Workflow)</span>
            </h2>
          </div>

          {/* Interactive Sandbox Preview */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/20 p-8 shadow-2xl">
            {/* Mock Sandbox Interface */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-96 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              
              {/* Draggable Components Palette */}
              <div className="absolute top-4 left-4 bottom-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-y-auto">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Service Tools</h4>
                <div className="space-y-3">
                  
                  {/* Input Group */}
                  <div>
                    <button 
                      onClick={() => toggleGroup('Input')}
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        Input
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${collapsedGroups['Input'] ? 'rotate-0' : 'rotate-90'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {!collapsedGroups['Input'] && (
                      <div className="mt-2 ml-5 space-y-2">
                        {/* HTTP In Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'http-in', {
                            label: 'HTTP In',
                            nodeType: 'input',
                            style: {
                              background: '#3B82F6',
                              color: 'white',
                              border: '2px solid #1D4ED8',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">HTTP In</span>
                        </div>

                        {/* Auth Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'auth', {
                            label: 'Auth',
                            nodeType: 'input',
                            style: {
                              background: '#3B82F6',
                              color: 'white',
                              border: '2px solid #1D4ED8',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">Auth</span>
                        </div>

                        {/* Param Extract Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'param-extract', {
                            label: 'Param Extract',
                            nodeType: 'input',
                            style: {
                              background: '#3B82F6',
                              color: 'white',
                              border: '2px solid #1D4ED8',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">Param Extract</span>
                        </div>

                        {/* Validator Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'validator', {
                            label: 'Validator',
                            nodeType: 'input',
                            style: {
                              background: '#3B82F6',
                              color: 'white',
                              border: '2px solid #1D4ED8',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">Validator</span>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Process Group */}
                  <div>
                    <button 
                      onClick={() => toggleGroup('Process')}
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        Process
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${collapsedGroups['Process'] ? 'rotate-0' : 'rotate-90'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {!collapsedGroups['Process'] && (
                      <div className="mt-2 ml-5 space-y-2">
                        {/* Mapper Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'mapper', {
                            label: 'Mapper',
                            nodeType: 'process',
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
                          <span className="text-xs text-slate-600 dark:text-slate-400">Mapper</span>
                        </div>

                        {/* DB Action Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'db-action', {
                            label: 'DB Action',
                            nodeType: 'process',
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
                          <span className="text-xs text-slate-600 dark:text-slate-400">DB Action</span>
                        </div>

                        {/* JSON Logic Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'json-logic', {
                            label: 'JSON Logic',
                            nodeType: 'process',
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
                          <span className="text-xs text-slate-600 dark:text-slate-400">JSON Logic</span>
                        </div>

                        {/* Branch Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'branch', {
                            label: 'Branch',
                            nodeType: 'process',
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
                          <span className="text-xs text-slate-600 dark:text-slate-400">Branch</span>
                        </div>

                        {/* Paginator Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'paginator', {
                            label: 'Paninator',
                            nodeType: 'process',
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
                          <span className="text-xs text-slate-600 dark:text-slate-400">Paginator</span>
                        </div>

                        {/* Error Handler Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'error-handler', {
                            label: 'Error Handler',
                            nodeType: 'process',
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
                          <span className="text-xs text-slate-600 dark:text-slate-400">Error Handler</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Output Group */}
                  <div>
                    <button 
                      onClick={() => toggleGroup('Output')}
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                        Output
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${collapsedGroups['Output'] ? 'rotate-0' : 'rotate-90'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {!collapsedGroups['Output'] && (
                      <div className="mt-2 ml-5 space-y-2">
                        {/* HTTP Out Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'http-out', {
                            label: 'HTTP Out',
                            nodeType: 'output',
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
                          <span className="text-xs text-slate-600 dark:text-slate-400">HTTP Out</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Group Service Group */}
                  <div>
                    <button 
                      onClick={() => toggleGroup('Group Service')}
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                        Group Service
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${collapsedGroups['Group Service'] ? 'rotate-0' : 'rotate-90'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {!collapsedGroups['Group Service'] && (
                      <div className="mt-2 ml-5 space-y-2">
                        {/* Group Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'group', {
                            label: 'Group',
                            nodeType: 'group',
                            style: {
                              background: 'rgba(251, 146, 60, 0.1)',
                              color: '#F97316',
                              border: '2px dashed #F97316',
                              borderRadius: '15px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 200,
                              height: 150,
                              textAlign: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">Group</span>
                        </div>
                      </div>
                    )}
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
                      onNodeDrag={onNodeDrag}
                      onNodeDragStop={onNodeDragStop}
                      onInit={setReactFlowInstance}
                      nodeTypes={nodeTypes}
                      edgeTypes={edgeTypes}
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

export default WorkflowServiceBuilder;
