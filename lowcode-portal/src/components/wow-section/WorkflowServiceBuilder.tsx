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
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { injectStyles } from './constants/styles';
import CustomNode from './components/CustomNode';
import OptionPanel from './components/OptionPanel';
import PallateTools from './components/PallateTools';
import { createNodesFromTemplate } from './utils/templateHelpers';
import { customEdgeTypes } from './components/CustomEdges';

// Inject styles
injectStyles();

// Initial nodes for the ReactFlow demo
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  customNode: CustomNode,
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
    'Special': false,
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
  
  // State for template selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // Service Builder specific options
  const [serviceType, setServiceType] = useState('RestApis');
  const [programmingLanguage, setProgrammingLanguage] = useState('NodeJS');
  const [enableLogs, setEnableLogs] = useState(true);
  const [enableAuditLogs, setEnableAuditLogs] = useState(false);
  const [rateLimit, setRateLimit] = useState('100');
  const [authType, setAuthType] = useState('JWT Token');
  const [databaseType, setDatabaseType] = useState('PostgreSQL');
  const [enableCache, setEnableCache] = useState(false);

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

    // Function to reorder tags after node deletion
    const reorderNodeTags = useCallback((remainingNodes: Node[]) => {
      // Filter nodes that have order numbers and sort them
      const nodesWithOrder = remainingNodes
        .filter(node => node.data.orderNumber)
        .sort((a, b) => a.data.orderNumber - b.data.orderNumber);
      
      // Update order numbers sequentially
      const updatedNodes = remainingNodes.map(node => {
        const nodeIndex = nodesWithOrder.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          const newOrderNumber = nodeIndex + 1;
          return {
            ...node,
            data: {
              ...node.data,
              orderNumber: newOrderNumber,
              tagLabel: node.data.tagLabel === node.data.orderNumber?.toString() 
                ? newOrderNumber.toString() 
                : node.data.tagLabel // Keep custom tag labels
            }
          };
        }
        return node;
      });
      
      return updatedNodes;
    }, []);

    // Custom onNodesChange to handle group movement and deletion
    const onNodesChange = useCallback((changes: any[]) => {
      // Check for group node deletions before applying changes
      const deletionChanges = changes.filter(change => change.type === 'remove');
      
      deletionChanges.forEach(change => {
        const deletedNode = nodes.find(n => n.id === change.id);
        
        if (deletedNode?.data?.nodeType === 'group') {
          // Find all nodes in this group
          const nodesInGroup = nodes.filter(n => n.data?.groupId === change.id);
          
          if (nodesInGroup.length > 0) {
            console.log(`Deleting group ${change.id} with ${nodesInGroup.length} child nodes`);
            
            // Add removal changes for all child nodes
            const childDeletions = nodesInGroup.map(node => ({
              type: 'remove' as const,
              id: node.id
            }));
            
            // Apply child deletions first
            originalOnNodesChange(childDeletions);
            
            // Also remove related edges
            const edgesToRemove = edges.filter(edge => 
              nodesInGroup.some(node => edge.source === node.id || edge.target === node.id)
            );
            
            if (edgesToRemove.length > 0) {
              console.log(`Removing ${edgesToRemove.length} edges connected to deleted group nodes`);
              setEdges(currentEdges => 
                currentEdges.filter(edge => 
                  !edgesToRemove.some(toRemove => toRemove.id === edge.id)
                )
              );
            }
          }
        }
      });
      
      // Apply the original changes
      originalOnNodesChange(changes);
      
      // Reorder tags if nodes were deleted
      const hasNodeDeletions = changes.some(change => change.type === 'remove');
      if (hasNodeDeletions) {
        setTimeout(() => {
          setNodes((currentNodes) => reorderNodeTags(currentNodes));
        }, 50); // Small delay to ensure nodes are updated
      }
      
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
    }, [originalOnNodesChange, nodes, setNodes, edges, setEdges, reorderNodeTags]);
    
    // Drag and drop functionality
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
    const onConnect = useCallback((params: Connection) => {
      const newEdge = { 
        ...params, 
        type: 'stepEdge',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: 'step' }
      };
      setEdges((els) => addEdge(newEdge, els));
    }, [setEdges]);

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

    // Handle node tag updates
    const updateNodeTag = useCallback((nodeId: string, newTag: string) => {
      setNodes((nds) => 
        nds.map((node) => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, tagLabel: newTag } }
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

    // Listen for node and edge label update events
    useEffect(() => {
      const handleUpdateNodeLabel = (e: CustomEvent) => {
        const { nodeId, newLabel } = e.detail;
        updateNodeLabel(nodeId, newLabel);
      };

      const handleUpdateNodeTag = (e: CustomEvent) => {
        const { nodeId, newTag } = e.detail;
        updateNodeTag(nodeId, newTag);
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
      window.addEventListener('updateNodeTag', handleUpdateNodeTag as EventListener);
      window.addEventListener('updateEdgeLabel', handleUpdateEdgeLabel as EventListener);
      window.addEventListener('nodeDropOnGroup', handleNodeDropOnGroupEvent as EventListener);
      window.addEventListener('groupResize', handleGroupResizeEvent as EventListener);
      
      return () => {
        window.removeEventListener('updateNodeLabel', handleUpdateNodeLabel as EventListener);
        window.removeEventListener('updateNodeTag', handleUpdateNodeTag as EventListener);
        window.removeEventListener('updateEdgeLabel', handleUpdateEdgeLabel as EventListener);
        window.removeEventListener('nodeDropOnGroup', handleNodeDropOnGroupEvent as EventListener);
        window.removeEventListener('groupResize', handleGroupResizeEvent as EventListener);
      };
    }, [updateNodeLabel, updateNodeTag, updateEdgeLabel, handleGroupResize]);

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
      
      // Debug: log nodes in groups and group relationships
      const groupedNodes = nodes.filter(n => n.data?.isInGroup);
      const groupNodes = nodes.filter(n => n.data?.nodeType === 'group');
      
      if (groupedNodes.length > 0) {
        console.log('Current nodes in groups:', groupedNodes);
      }
      if (groupNodes.length > 0) {
        console.log('Current group nodes:', groupNodes);
        groupNodes.forEach(group => {
          const childNodes = nodes.filter(n => n.data?.groupId === group.id);
          console.log(`Group ${group.id} (${group.data.label}) has ${childNodes.length} child nodes:`, childNodes.map(n => n.id));
        });
      }
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
        
        // Calculate next order number
        const maxOrderNumber = Math.max(0, ...nodes.map(n => n.data.orderNumber || 0));
        const nextOrderNumber = maxOrderNumber + 1;

        const newNode = {
          id: getId(),
          type: 'customNode',
          position,
          data: { 
            label: nodeData.label,
            nodeType: nodeData.nodeType || 'default',
            orderNumber: nextOrderNumber,
            tagLabel: nextOrderNumber.toString(),
            style: nodeData.style 
          },
        };
  
        setNodes((nds) => nds.concat(newNode));
      },
      [reactFlowInstance, setNodes, nodes]
    );
  
    const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData));
      event.dataTransfer.effectAllowed = 'move';
    };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900" : ""}>
      <section id="sandbox" className={isFullscreen ? "w-full h-full" : "py-32 bg-gradient-to-br from-green-50 to-teal-50 dark:from-slate-800 dark:to-emerald-900 relative overflow-hidden"}>
        {!isFullscreen && <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>}
        
        <div className={isFullscreen ? "w-full h-full relative" : "max-w-7xl mx-auto px-4 relative"}>
          {!isFullscreen && (
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Sandbox - 
                <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"> (Service Builder Workflow)</span>
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
              {!isFullscreen && <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5"></div>}
              
              {/* Draggable Components Palette */}
              <PallateTools 
                collapsedGroups={collapsedGroups}
                toggleGroup={toggleGroup}
                selectedTemplate={selectedTemplate}
                handleTemplateChange={handleTemplateChange}
                onDragStart={onDragStart}
                isFullscreen={isFullscreen}
              />

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
                      onNodeDrag={onNodeDrag}
                      onNodeDragStop={onNodeDragStop}
                      onInit={setReactFlowInstance}
                      nodeTypes={nodeTypes}
                      edgeTypes={customEdgeTypes}
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

                  {/* Option Panel */}
                  <OptionPanel
                    showOptionPanel={showOptionPanel}
                    toggleOptionPanel={toggleOptionPanel}
                    serviceType={serviceType}
                    setServiceType={setServiceType}
                    programmingLanguage={programmingLanguage}
                    setProgrammingLanguage={setProgrammingLanguage}
                    enableLogs={enableLogs}
                    setEnableLogs={setEnableLogs}
                    enableAuditLogs={enableAuditLogs}
                    setEnableAuditLogs={setEnableAuditLogs}
                    rateLimit={rateLimit}
                    setRateLimit={setRateLimit}
                    authType={authType}
                    setAuthType={setAuthType}
                    databaseType={databaseType}
                    setDatabaseType={setDatabaseType}
                    enableCache={enableCache}
                    setEnableCache={setEnableCache}
                  />

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

export default WorkflowServiceBuilder;
