import { NodeTypes } from 'reactflow';
import React from 'react';
import CustomNode from './CustomNode';

// Wrapper component for ReactFlow compatibility
const CustomNodeWrapper = (props: any) => {
  return React.createElement(CustomNode, props);
};

export const nodeTypes: NodeTypes = {
  customNode: CustomNodeWrapper,
};

export { default as CustomNode } from './CustomNode';
export type { NodeData } from './CustomNode';