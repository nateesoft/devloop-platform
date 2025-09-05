'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

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

  useEffect(() => {
    if (isEditingTag && tagInputRef.current) {
      tagInputRef.current.focus();
      tagInputRef.current.select();
    }
  }, [isEditingTag]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagLabel(e.target.value);
  };

  const finishEditing = () => {
    setIsEditing(false);
    
    // Dispatch custom event to update the node label
    const updateEvent = new CustomEvent('updateNodeLabel', {
      detail: { nodeId: id, label: label }
    });
    window.dispatchEvent(updateEvent);
  };

  const finishTagEditing = () => {
    setIsEditingTag(false);
    
    // Dispatch custom event to update the node tag
    const updateTagEvent = new CustomEvent('updateNodeTag', {
      detail: { nodeId: id, tagLabel: tagLabel }
    });
    window.dispatchEvent(updateTagEvent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setLabel(data.label || '');
      setIsEditing(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishTagEditing();
    } else if (e.key === 'Escape') {
      setTagLabel(data.tagLabel || data.orderNumber?.toString() || '');
      setIsEditingTag(false);
    }
  };

  const handleTagDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTag(true);
  };

  // Function to get tag colors based on order number
  const getTagColor = (orderNumber: number) => {
    const colors = [
      { bg: '#EF4444', hover: '#DC2626' }, // Red
      { bg: '#F97316', hover: '#EA580C' }, // Orange  
      { bg: '#EAB308', hover: '#CA8A04' }, // Yellow
      { bg: '#22C55E', hover: '#16A34A' }, // Green
      { bg: '#3B82F6', hover: '#2563EB' }, // Blue
      { bg: '#8B5CF6', hover: '#7C3AED' }, // Purple
      { bg: '#EC4899', hover: '#DB2777' }, // Pink
      { bg: '#06B6D4', hover: '#0891B2' }, // Cyan
      { bg: '#84CC16', hover: '#65A30D' }, // Lime
      { bg: '#F59E0B', hover: '#D97706' }, // Amber
    ];
    return colors[(orderNumber - 1) % colors.length];
  };

  // Check if this is a group node
  const isGroupNode = data.nodeType === 'group';
  const isInGroup = data.isInGroup;
  
  // Get the node type or default to 'default'
  const nodeType = data.nodeType || 'default';

  // Define styles for different node types
  const baseStyle = data.style || {};
  const groupStyle = isInGroup ? { zIndex: 100 } : {};
  const combinedStyle = { ...baseStyle, ...groupStyle };

  // Handle styles for connection points
  const handleStyles = {
    left: { 
      left: -8, 
      width: 16, 
      height: 16, 
      background: '#fff', 
      border: '2px solid #555',
      borderRadius: '50%'
    },
    right: { 
      right: -8, 
      width: 16, 
      height: 16, 
      background: '#fff', 
      border: '2px solid #555',
      borderRadius: '50%'
    },
    top: { 
      top: -8, 
      width: 16, 
      height: 16, 
      background: '#fff', 
      border: '2px solid #555',
      borderRadius: '50%'
    },
    bottom: { 
      bottom: -8, 
      width: 16, 
      height: 16, 
      background: '#fff', 
      border: '2px solid #555',
      borderRadius: '50%'
    }
  };

  const renderNodeContent = () => {
    if (isGroupNode) {
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
            e.currentTarget.classList.remove('drag-over');
          }}
        >
          {renderLabelContent()}
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            Drop nodes here to group them
          </div>
        </div>
      );
    }
    
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
    </div>
  );
};

export default CustomNode;