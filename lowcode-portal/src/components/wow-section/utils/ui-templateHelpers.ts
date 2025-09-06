import { WORKFLOW_TEMPLATES } from '../constants/ui-templates';

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
