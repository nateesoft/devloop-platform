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
  
  /* Allow pointer events on label editing elements */
  .group-node-container [style*="pointer-events: auto"] {
    pointer-events: auto !important;
  }
  
  .group-node-container [style*="pointer-events: auto"] * {
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
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [tagLabel, setTagLabel] = useState(data.tagLabel || data.orderNumber?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Focus tag input when editing starts
  useEffect(() => {
    if (isEditingTag && tagInputRef.current) {
      tagInputRef.current.focus();
      tagInputRef.current.select();
    }
  }, [isEditingTag]);


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

  const handleTagDoubleClick = () => {
    setIsEditingTag(true);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      finishTagEditing();
    }
  };

  const finishTagEditing = () => {
    setIsEditingTag(false);
    if (tagLabel.trim() && tagLabel !== data.tagLabel) {
      // Update node tag through a custom event
      const updateEvent = new CustomEvent('updateNodeTag', {
        detail: { nodeId: id, newTag: tagLabel.trim() }
      });
      window.dispatchEvent(updateEvent);
    } else {
      setTagLabel(data.tagLabel || data.orderNumber?.toString() || '');
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagLabel(e.target.value);
  };

  // Get tag color based on order number
  const getTagColor = (orderNumber: number) => {
    const colors = [
      { bg: '#3B82F6', hover: '#2563EB', border: '#1D4ED8' }, // Blue - ลำดับ 1
      { bg: '#10B981', hover: '#059669', border: '#047857' }, // Green - ลำดับ 2  
      { bg: '#8B5CF6', hover: '#7C3AED', border: '#6D28D9' }, // Purple - ลำดับ 3
      { bg: '#F59E0B', hover: '#D97706', border: '#B45309' }, // Orange - ลำดับ 4
      { bg: '#EF4444', hover: '#DC2626', border: '#B91C1C' }, // Red - ลำดับ 5
      { bg: '#06B6D4', hover: '#0891B2', border: '#0E7490' }, // Cyan - ลำดับ 6
      { bg: '#84CC16', hover: '#65A30D', border: '#4D7C0F' }, // Lime - ลำดับ 7
      { bg: '#EC4899', hover: '#DB2777', border: '#BE185D' }, // Pink - ลำดับ 8
      { bg: '#6366F1', hover: '#4F46E5', border: '#4338CA' }, // Indigo - ลำดับ 9
      { bg: '#14B8A6', hover: '#0D9488', border: '#0F766E' }, // Teal - ลำดับ 10
    ];
    
    // Use modulo to cycle through colors if order number exceeds available colors
    const colorIndex = (orderNumber - 1) % colors.length;
    return colors[colorIndex];
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
          <div className="absolute top-2 left-2 text-sm font-semibold opacity-80" style={{pointerEvents: 'auto'}}>
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

    // External node with API/web service icon
    if (nodeType === 'externalService') {
      return (
        <div className="px-3 py-2 text-center flex flex-col items-center" style={data.style}>
          <div className="flex items-center justify-center mb-1">
            {/* External Service Icon - Simple globe with arrow */}
            <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2c2.5 2.5 2.5 9.5 0 10"/>
              <path d="M12 22c-2.5-2.5-2.5-9.5 0-10"/>
              <path d="M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {renderLabelContent()}
        </div>
      );
    }
    
    // Add icons for different node types - designed to represent their actual meanings
    const renderNodeIcon = () => {
      switch (nodeType) {
        // Input nodes (สิ่งที่เข้ามา)
        case 'httpIn': // เมื่อมีคนมาเคาะประตู - จุดเริ่มต้น เมื่อมีคนเรียก URL
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              <path d="M9 12v6"/>
              <path d="M15 9v9"/>
            </svg>
          );
        case 'authentication': // ขอดูบัตรก่อนเข้า - ตรวจสอบสิทธิ์
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M12 1a3 3 0 0 0-3 3v1m6-4a3 3 0 0 1 3 3v1"/>
              <rect x="6" y="5" width="12" height="13" rx="1"/>
              <path d="M12 9v4"/>
            </svg>
          );
        case 'paramExtract': // หยิบข้อมูลจากคำขอ - อ่านค่าที่ส่งมา
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              <path d="M8 12h8"/>
              <path d="M12 8v8"/>
            </svg>
          );
        case 'validator': // ตรวจสอบความถูกต้อง - เช็กว่าข้อมูลกรอกมาถูกหรือไม่
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          );

        // Process nodes (สิ่งที่เราทำ)
        case 'mapper': // ปรับข้อมูลให้นำไปใช้ได้ - แปลง/เติมค่า
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
              <path d="M16 18v-4a2 2 0 0 1 2-2h4"/>
              <rect x="3" y="3" width="8" height="6" rx="1"/>
              <rect x="13" y="13" width="8" height="6" rx="1"/>
              <path d="M7 12v2"/>
              <path d="M17 10v2"/>
            </svg>
          );
        case 'databaseAction': // ทำงานกับตารางข้อมูล - ค้นหา เพิ่ม แก้ไข ลบข้อมูล
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          );
        case 'jsonLogic': // ใช้สูตรหรือกฎ - ประมวลผลตามเงื่อนไข
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M9.26 9a2 2 0 1 1 0 4H3v-4h6.26z"/>
              <path d="M21 11V9a2 2 0 0 0-2-2H3v4h16a2 2 0 0 0 2-2z"/>
              <path d="M3 15h6.26a2 2 0 1 1 0 4H3v-4z"/>
              <circle cx="17" cy="12" r="1"/>
            </svg>
          );
        case 'branch': // แยกทางเดิน - ตัดสินใจ
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <line x1="6" y1="3" x2="6" y2="15"/>
              <circle cx="18" cy="6" r="3"/>
              <circle cx="6" cy="18" r="3"/>
              <path d="M18 9a9 9 0 0 1-9 9"/>
            </svg>
          );
        case 'paginator': // แบ่งข้อมูลเป็นหน้า ๆ - แสดงผลทีละชุด
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <path d="M7 8h10"/>
              <path d="M7 12h7"/>
              <path d="M7 16h4"/>
            </svg>
          );
        case 'errorHandler': // จัดการปัญหา - ถ้าเกิดข้อผิดพลาด ให้ส่งข้อความเข้าใจง่าย
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          );

        // Output nodes (สิ่งที่ออกไป)
        case 'httpResponse': // ส่งคำตอบกลับ - ขั้นตอนสุดท้าย ส่งผลลัพธ์กลับ
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          );

        // Special nodes
        case 'trigger': // จุดเริ่มต้นอื่นๆ ที่ไม่ใช่ HTTP
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
            </svg>
          );
        case 'externalService': // เชื่อมต่อกับบริการภายนอก
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2c2.5 2.5 2.5 9.5 0 10"/>
              <path d="M12 22c-2.5-2.5-2.5-9.5 0-10"/>
              <path d="M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          );

        // Existing node types for backward compatibility
        case 'decision':
          return (
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12c.5 0-.5-10-9-10s-9.5 10-9 10c-.5 0 .5 10 9 10s9.5-10 9-10z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          );
        
        default:
          return null;
      }
    };

    return (
      <div className="px-3 py-2 text-center flex items-center justify-center relative" style={data.style}>
        {renderNodeIcon()}
        <div>{renderLabelContent()}</div>
        {/* Render tag if this is the first node or has orderNumber */}
        {(data.isFirstNode || data.orderNumber) && renderTag()}
      </div>
    );
  };

  const renderTag = () => {
    const orderNumber = data.orderNumber || 1;
    const tagColor = getTagColor(orderNumber);
    
    return (
      <div className="absolute -top-2 -left-2 z-10">
        {isEditingTag ? (
          <input
            ref={tagInputRef}
            type="text"
            value={tagLabel}
            onChange={handleTagInputChange}
            onBlur={finishTagEditing}
            onKeyDown={handleTagKeyDown}
            className="w-8 h-6 text-white text-xs font-bold rounded-full text-center outline-none border-2 border-white shadow-lg"
            style={{ backgroundColor: tagColor.bg }}
            placeholder="1"
          />
        ) : (
          <div
            onDoubleClick={handleTagDoubleClick}
            className="w-8 h-6 text-white text-xs font-bold rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-white transition-all duration-200 hover:scale-110 hover:shadow-xl"
            style={{ 
              backgroundColor: tagColor.bg,
              borderColor: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tagColor.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tagColor.bg;
            }}
            title={`Order ${orderNumber} - Double-click to edit tag`}
          >
            {tagLabel || data.orderNumber || '1'}
          </div>
        )}
      </div>
    );
  };

  const renderLabelContent = () => {
    const nodeType = data.nodeType || 'default';
    const isGroupNode = nodeType === 'group';
    
    return (
      <div onDoubleClick={handleDoubleClick} className="min-w-0 relative">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={handleInputChange}
            onBlur={finishEditing}
            onKeyDown={handleKeyDown}
            className={isGroupNode 
              ? "bg-orange-100 border border-orange-300 rounded px-2 py-1 outline-none text-center w-full text-orange-800 placeholder-orange-400" 
              : "bg-white/20 border border-white/40 rounded px-1 outline-none text-center w-full text-white placeholder-white/70"
            }
            style={{ fontSize: 'inherit', fontWeight: 'inherit' }}
            placeholder={isGroupNode ? "Enter group name..." : "Enter label..."}
          />
        ) : (
          <div 
            className={isGroupNode 
              ? "cursor-pointer select-none hover:bg-orange-200/30 rounded px-2 py-0.5 transition-colors" 
              : "cursor-pointer select-none hover:bg-white/10 rounded px-1 py-0.5 transition-colors"
            } 
            title="Double-click to edit"
          >
            {data.label}
          </div>
        )}
      </div>
    );
  };

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
          right: { right: -8, top: '50%', transform: 'translateY(-50%)', background: '#555' },
          top: { top: -8, left: '50%', transform: 'translateX(-50%)', background: '#555' },
          bottom: { bottom: -8, left: '50%', transform: 'translateX(-50%)', background: '#555' }
        };
      case 'group':
        return {
          left: { left: -8, top: '20px', background: '#F97316' },
          right: { right: -8, top: '20px', background: '#F97316' },
          top: { top: -8, left: '50%', transform: 'translateX(-50%)', background: '#F97316' },
          bottom: { bottom: -8, left: '50%', transform: 'translateX(-50%)', background: '#F97316' }
        };
      default:
        return {
          left: { left: -8, top: '50%', transform: 'translateY(-50%)', background: '#555' },
          right: { right: -8, top: '50%', transform: 'translateY(-50%)', background: '#555' },
          top: { top: -8, left: '50%', transform: 'translateX(-50%)', background: '#555' },
          bottom: { bottom: -8, left: '50%', transform: 'translateX(-50%)', background: '#555' }
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
      {/* Input handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-left"
        style={handleStyles.left}
      />
      
      <Handle
        type="target"
        position={Position.Top}
        id="input-top"
        style={handleStyles.top}
      />
      
      {renderNodeContent()}
      
      {/* Output handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="output-right"
        style={handleStyles.right}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="output-bottom"
        style={handleStyles.bottom}
      />

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

// Custom Step Edge Component with right-angle connections
const StepEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) => {
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

  // Create step path (right-angle turns)
  const createStepPath = () => {
    const midX = sourceX + (targetX - sourceX) / 2;
    return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
  };

  const stepPath = createStepPath();
  const labelX = sourceX + (targetX - sourceX) / 2;
  const labelY = sourceY + (targetY - sourceY) / 2;

  return (
    <>
      <path
        id={id}
        d={stepPath}
        fill="none"
        stroke="#b1b1b7"
        strokeWidth={2}
        markerEnd="url(#react-flow__arrowclosed)"
      />
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
              placeholder="Step..."
            />
          ) : (
            <div
              onDoubleClick={handleDoubleClick}
              className="bg-white/90 backdrop-blur-sm border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-700 cursor-pointer hover:bg-white shadow-sm transition-all duration-200 hover:border-blue-400"
              title="Double-click to edit"
            >
              {data?.label || 'step'}
            </div>
          )}
        </div>
      </foreignObject>
    </>
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
              {data?.label || '...'}
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
      isFirstNode: true,
      orderNumber: 1,
      tagLabel: '1',
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
      orderNumber: 2,
      tagLabel: '2',
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
      orderNumber: 3,
      tagLabel: '3',
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
    type: 'stepEdge', 
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { label: 'access' }
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3', 
    type: 'stepEdge', 
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { label: 'navigate' }
  }
];

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
  stepEdge: StepEdge,
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
              type: 'remove',
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
              const edgeDeletions = edgesToRemove.map(edge => ({
                type: 'remove',
                id: edge.id
              }));
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
              <div className={isFullscreen 
                ? "absolute top-4 left-4 bottom-4 w-56 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-y-auto" 
                : "absolute top-4 left-4 bottom-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-y-auto"
              }>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Service Tools</h4>
                  {isFullscreen && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">ESC to exit</span>
                  )}
                </div>
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
                            nodeType: 'httpIn',
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
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-xs text-slate-600 dark:text-slate-400">HTTP In</span>
                        </div>

                        {/* Auth Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'auth', {
                            label: 'Auth',
                            nodeType: 'authentication',
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
                            nodeType: 'paramExtract',
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
                            nodeType: 'validator',
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
                            nodeType: 'mapper',
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
                            nodeType: 'databaseAction',
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
                            nodeType: 'jsonLogic',
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
                            nodeType: 'branch',
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
                            label: 'Paginator',
                            nodeType: 'paginator',
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
                            nodeType: 'errorHandler',
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
                            nodeType: 'httpResponse',
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

                  {/* Special Group */}
                  <div>
                    <button 
                      onClick={() => toggleGroup('Special')}
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                        Special
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${collapsedGroups['Special'] ? 'rotate-0' : 'rotate-90'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {!collapsedGroups['Special'] && (
                      <div className="mt-2 ml-5 space-y-2">
                        {/* Trigger Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'trigger', {
                            label: 'Trigger',
                            nodeType: 'trigger',
                            style: {
                              background: '#FFFF33',
                              color: 'black',
                              border: '2px solid #F0F000',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span className="text-xs text-slate-600 dark:text-slate-400">Trigger</span>
                        </div>

                        {/* External Node */}
                        <div 
                          className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => onDragStart(event, 'external', {
                            label: 'External',
                            nodeType: 'externalService',
                            style: {
                              background: '#FFFF33',
                              color: 'black',
                              border: '2px solid #F0F000',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              width: 140,
                              textAlign: 'center',
                            }
                          })}
                        >
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M2 12h20"/>
                            <path d="M12 2c2.5 2.5 2.5 9.5 0 10"/>
                            <path d="M12 22c-2.5-2.5-2.5-9.5 0-10"/>
                            <path d="M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-xs text-slate-600 dark:text-slate-400">External</span>
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
                    <div className="absolute top-16 left-4 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 z-20 w-96 max-h-96 overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Service Configuration</h3>
                        <button 
                          onClick={toggleOptionPanel}
                          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Service Builder Options */}
                      <div className="space-y-4">
                        
                        {/* Service Type */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Service Type
                          </label>
                          <select 
                            value={serviceType} 
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                          >
                            <option value="RestApis">REST APIs</option>
                            <option value="Graphql">GraphQL</option>
                            <option value="SocketIO">Socket.IO</option>
                            <option value="Webhook">Webhook</option>
                          </select>
                        </div>

                        {/* Programming Language for Export */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Export Language
                          </label>
                          <select 
                            value={programmingLanguage} 
                            onChange={(e) => setProgrammingLanguage(e.target.value)}
                            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                          >
                            <option value="NodeJS">Node.js</option>
                            <option value="NestJS">NestJS</option>
                            <option value="Java Springboot">Java Spring Boot</option>
                            <option value="Golang">Go</option>
                            <option value="Python">Python</option>
                            <option value="PHP">PHP</option>
                          </select>
                        </div>

                        {/* Logs & Audit */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={enableLogs}
                                onChange={(e) => setEnableLogs(e.target.checked)}
                                className="mr-2 w-4 h-4"
                              />
                              Enable System Logs
                            </label>
                          </div>
                          <div className="flex-1">
                            <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={enableAuditLogs}
                                onChange={(e) => setEnableAuditLogs(e.target.checked)}
                                className="mr-2 w-4 h-4"
                              />
                              Audit Logs
                            </label>
                          </div>
                        </div>

                        {/* Rate Limit */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Rate Limit (req/min)
                          </label>
                          <input
                            type="number"
                            value={rateLimit}
                            onChange={(e) => setRateLimit(e.target.value)}
                            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                            placeholder="100"
                            min="1"
                            max="10000"
                          />
                        </div>

                        {/* Authentication */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Authentication
                          </label>
                          <select 
                            value={authType} 
                            onChange={(e) => setAuthType(e.target.value)}
                            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                          >
                            <option value="Basic Auth">Basic Auth</option>
                            <option value="OAuth2">OAuth 2.0</option>
                            <option value="JWT Token">JWT Token</option>
                            <option value="API Key">API Key</option>
                            <option value="None">No Authentication</option>
                          </select>
                        </div>

                        {/* Database */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Database
                          </label>
                          <select 
                            value={databaseType} 
                            onChange={(e) => setDatabaseType(e.target.value)}
                            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                          >
                            <option value="MySQL">MySQL</option>
                            <option value="PostgreSQL">PostgreSQL</option>
                            <option value="SQLite">SQLite</option>
                            <option value="MongoDB">MongoDB</option>
                            <option value="Redis">Redis</option>
                          </select>
                        </div>

                        {/* Cache */}
                        <div>
                          <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={enableCache}
                              onChange={(e) => setEnableCache(e.target.checked)}
                              className="mr-2 w-4 h-4"
                            />
                            Enable Cache System
                          </label>
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

export default WorkflowServiceBuilder;
