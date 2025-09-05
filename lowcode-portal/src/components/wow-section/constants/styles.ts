// CSS styles for ReactFlow components
export const groupNodeStyles = `
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

// Inject styles function
export const injectStyles = () => {
  if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = groupNodeStyles;
    document.head.appendChild(styleSheet);
  }
};