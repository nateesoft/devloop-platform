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