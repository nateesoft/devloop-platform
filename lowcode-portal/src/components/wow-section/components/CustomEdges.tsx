'use client';

import React, { useState, useRef, useEffect } from 'react';
import { EdgeProps, getBezierPath, BaseEdge, MarkerType } from 'reactflow';

// Custom Step Edge Component with editable label showing step numbers
export const StepEdgeComponent = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd
}: EdgeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const finishEditing = () => {
    setIsEditing(false);
    
    // Dispatch custom event to update the edge label
    const updateEvent = new CustomEvent('updateEdgeLabel', {
      detail: { edgeId: id, label: label }
    });
    window.dispatchEvent(updateEvent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setLabel(data?.label || '');
      setIsEditing(false);
    }
  };

  // Create a step path with rounded corners
  const stepPath = `
    M ${sourceX} ${sourceY}
    L ${sourceX + 50} ${sourceY}
    L ${sourceX + 50} ${targetY}
    L ${targetX} ${targetY}
  `;

  const labelX = sourceX + 50;
  const labelY = (sourceY + targetY) / 2;

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
              className="bg-blue-500 text-white px-2 py-1 text-xs rounded cursor-pointer hover:bg-blue-600 shadow-sm transition-colors duration-200 font-medium"
              title="Double-click to edit step label"
            >
              {data?.label || 'step'}
            </div>
          )}
        </div>
      </foreignObject>
    </>
  );
};

// Custom Labeled Edge Component with editable labels
export const LabeledEdgeComponent = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd
}: EdgeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const finishEditing = () => {
    setIsEditing(false);
    
    // Dispatch custom event to update the edge label
    const updateEvent = new CustomEvent('updateEdgeLabel', {
      detail: { edgeId: id, label: label }
    });
    window.dispatchEvent(updateEvent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setLabel(data?.label || '');
      setIsEditing(false);
    }
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

// Export edge types for ReactFlow
export const customEdgeTypes = {
  stepEdge: StepEdgeComponent,
  labeledEdge: LabeledEdgeComponent,
};