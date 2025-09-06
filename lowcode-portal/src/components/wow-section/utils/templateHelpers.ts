import { Node, Edge, MarkerType } from 'reactflow';
import { WORKFLOW_TEMPLATES } from '../constants/templates';

// Function to apply template and create nodes/edges
export const createNodesFromTemplate = (templateId: string) => {
  const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
  if (!template) return { nodes: [], edges: [] };

  // If template has fullTemplate, return it directly
  if (template.fullTemplate) {
    return {
      nodes: template.fullTemplate.nodes,
      edges: template.fullTemplate.edges
    };
  }

  // Fallback to old method for backward compatibility
  if (!template.nodes) return { nodes: [], edges: [] };

  // Create nodes from template
  const newNodes: Node[] = template.nodes.map((nodeTemplate, index) => {
    const nodeTypeMapping: Record<string, string> = {
      httpIn: 'httpIn',
      paramExtract: 'paramExtract', 
      validator: 'validator',
      mapper: 'mapper',
      databaseAction: 'databaseAction',
      paginator: 'paginator',
      httpResponse: 'httpResponse',
      authentication: 'authentication'
    };

    const nodeType = nodeTypeMapping[nodeTemplate.type] || nodeTemplate.type;
    
    // Double the horizontal spacing between nodes
    const adjustedPosition = {
      x: index === 0 ? nodeTemplate.position.x : nodeTemplate.position.x + (index * 150),
      y: nodeTemplate.position.y
    };
    
    return {
      id: `template-node-${index}`,
      type: 'customNode',
      position: adjustedPosition,
      data: {
        label: nodeTemplate.label,
        nodeType: nodeType,
        style: getNodeStyle(nodeType),
        orderNumber: index + 1,
        isFirstNode: index === 0
      }
    };
  });

  // Create edges to connect the nodes
  const newEdges: Edge[] = [];
  for (let i = 0; i < newNodes.length - 1; i++) {
    newEdges.push({
      id: `template-edge-${i}`,
      source: newNodes[i].id,
      target: newNodes[i + 1].id,
      sourceHandle: 'output-right',
      targetHandle: 'input-left',
      type: 'stepEdge',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { label: `step ${i + 1}` }
    });
  }

  return { nodes: newNodes, edges: newEdges };
};

// Get style based on node type
export const getNodeStyle = (type: string) => {
  switch (type) {
    case 'httpIn':
    case 'paramExtract':
    case 'validator':
    case 'authentication':
      return {
        background: '#3B82F6',
        color: 'white',
        border: '2px solid #1D4ED8',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        width: 140,
        textAlign: 'center' as const,
      };
    case 'mapper':
    case 'databaseAction':
    case 'paginator':
      return {
        background: '#059669',
        color: 'white',
        border: '2px solid #047857',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        width: 140,
        textAlign: 'center' as const,
      };
    case 'httpResponse':
      return {
        background: '#DC2626',
        color: 'white',
        border: '2px solid #B91C1C',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        width: 140,
        textAlign: 'center' as const,
      };
    default:
      return {
        background: '#6B7280',
        color: 'white',
        border: '2px solid #4B5563',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        width: 140,
        textAlign: 'center' as const,
      };
  }
};