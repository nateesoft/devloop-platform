// Template definitions
interface TemplateDefinition {
  id: string;
  name: string;
  description?: string;
  nodes?: Array<{
    type: string;
    label: string;
    position: { x: number; y: number };
  }>;
  // For full JSON templates
  fullTemplate?: {
    nodes: any[];
    edges: any[];
  };
}

export const WORKFLOW_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'basic-webflow',
    name: 'ตัวอย่างเว็บทั่วไป',
    description: 'Template ตัวอย่าง workflow ทั่วไป',
    fullTemplate: {
      nodes: [
        {
          "id": "dndnode_55",
          "type": "customNode",
          "position": {
            "x": 13.418522645876408,
            "y": -47.582165149967494
          },
          "data": {
            "label": "User",
            "nodeType": "actor",
            "style": {
              "background": "transparent",
              "strokeColor": "#FFFAFA",
              "color": "#FFFAFA",
              "border": "none",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 1,
            "tagLabel": "1",
            "isFirstNode": true
          },
          "width": 92,
          "height": 128,
          "selected": false,
          "positionAbsolute": {
            "x": 13.418522645876408,
            "y": -47.582165149967494
          },
          "dragging": false
        },
        {
          "id": "dndnode_56",
          "type": "customNode",
          "position": {
            "x": 246.9978991551879,
            "y": -46.09439842060882
          },
          "data": {
            "label": "Login",
            "nodeType": "login",
            "style": {
              "background": "#10B981",
              "color": "white",
              "border": "2px solid #047857",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 2,
            "tagLabel": "2",
            "isFirstNode": false
          },
          "width": 132,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 246.9978991551879,
            "y": -46.09439842060882
          },
          "dragging": false
        },
        {
          "id": "dndnode_58",
          "type": "customNode",
          "position": {
            "x": 635.3050155178014,
            "y": -22.290130750870063
          },
          "data": {
            "label": "Route?",
            "nodeType": "route",
            "style": {
              "background": "red",
              "color": "white",
              "border": "2px solid darkred",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 3,
            "tagLabel": "3",
            "isFirstNode": false
          },
          "width": 100,
          "height": 100,
          "selected": false,
          "positionAbsolute": {
            "x": 635.3050155178014,
            "y": -22.290130750870063
          },
          "dragging": false
        },
        {
          "id": "dndnode_59",
          "type": "customNode",
          "position": {
            "x": 864.421091839037,
            "y": -130.89710199405314
          },
          "data": {
            "label": "User-Login",
            "nodeType": "actor",
            "style": {
              "background": "transparent",
              "strokeColor": "green",
              "color": "#FFFAFA",
              "border": "none",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 4,
            "tagLabel": "4",
            "isFirstNode": false
          },
          "width": 103,
          "height": 128,
          "selected": false,
          "positionAbsolute": {
            "x": 864.421091839037,
            "y": -130.89710199405314
          },
          "dragging": false
        },
        {
          "id": "dndnode_60",
          "type": "customNode",
          "position": {
            "x": 871.8599254858303,
            "y": 50.61043898770488
          },
          "data": {
            "label": "User-Admin",
            "nodeType": "actor",
            "style": {
              "background": "transparent",
              "strokeColor": "brown",
              "color": "#FFFAFA",
              "border": "none",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 5,
            "tagLabel": "5",
            "isFirstNode": false
          },
          "width": 108,
          "height": 128,
          "selected": false,
          "positionAbsolute": {
            "x": 871.8599254858303,
            "y": 50.61043898770488
          },
          "dragging": false
        },
        {
          "id": "dndnode_61",
          "type": "customNode",
          "position": {
            "x": 1149.2848963632966,
            "y": -140.02635801944064
          },
          "data": {
            "label": "Home-User",
            "nodeType": "page",
            "style": {
              "background": "#10B981",
              "color": "white",
              "border": "2px solid #047857",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 6,
            "tagLabel": "6",
            "isFirstNode": false
          },
          "width": 132,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1149.2848963632966,
            "y": -140.02635801944064
          },
          "dragging": false
        },
        {
          "id": "dndnode_62",
          "type": "customNode",
          "position": {
            "x": 1147.611763604173,
            "y": 45.691378243316336
          },
          "data": {
            "label": "Home-Admin",
            "nodeType": "page",
            "style": {
              "background": "#10B981",
              "color": "white",
              "border": "2px solid #047857",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 7,
            "tagLabel": "7",
            "isFirstNode": false
          },
          "width": 132,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1147.611763604173,
            "y": 45.691378243316336
          },
          "dragging": false
        },
        {
          "id": "dndnode_63",
          "type": "customNode",
          "position": {
            "x": 245.79320643637107,
            "y": 141.05994551338074
          },
          "data": {
            "label": "Landing",
            "nodeType": "page",
            "style": {
              "background": "#10B981",
              "color": "white",
              "border": "2px solid #047857",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 8,
            "tagLabel": "8",
            "isFirstNode": false
          },
          "width": 132,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 245.79320643637107,
            "y": 141.05994551338074
          },
          "dragging": false
        },
        {
          "id": "dndnode_64",
          "type": "customNode",
          "position": {
            "x": 1509.89444195087,
            "y": -41.59872684478308
          },
          "data": {
            "label": "Dashboard Component",
            "nodeType": "dashboard-component",
            "style": {
              "background": "#8B5CF6",
              "color": "white",
              "border": "2px solid #6D28D9",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 9,
            "tagLabel": "9",
            "isFirstNode": false
          },
          "width": 173,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1509.89444195087,
            "y": -41.59872684478308
          },
          "dragging": false
        },
        {
          "id": "dndnode_65",
          "type": "customNode",
          "position": {
            "x": 1521.7377733040835,
            "y": 104.50681014087121
          },
          "data": {
            "label": "CRUD Component",
            "nodeType": "crud-component",
            "style": {
              "background": "#8B5CF6",
              "color": "white",
              "border": "2px solid #6D28D9",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 10,
            "tagLabel": "10",
            "isFirstNode": false
          },
          "width": 145,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1521.7377733040835,
            "y": 104.50681014087121
          },
          "dragging": false
        },
        {
          "id": "dndnode_66",
          "type": "customNode",
          "position": {
            "x": 1515.5324153890595,
            "y": 253.43540010144744
          },
          "data": {
            "label": "Settings Component",
            "nodeType": "settings-component",
            "style": {
              "background": "#8B5CF6",
              "color": "white",
              "border": "2px solid #6D28D9",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 11,
            "tagLabel": "11",
            "isFirstNode": false
          },
          "width": 157,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1515.5324153890595,
            "y": 253.43540010144744
          },
          "dragging": false
        },
        {
          "id": "dndnode_67",
          "type": "customNode",
          "position": {
            "x": 1519.6693206657421,
            "y": -222.30870671705998
          },
          "data": {
            "label": "Settings Component",
            "nodeType": "settings-component",
            "style": {
              "background": "#8B5CF6",
              "color": "white",
              "border": "2px solid #6D28D9",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 12,
            "tagLabel": "12",
            "isFirstNode": false
          },
          "width": 157,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1519.6693206657421,
            "y": -222.30870671705998
          },
          "dragging": false
        }
      ],
      edges: [
        {
          "source": "dndnode_55",
          "sourceHandle": "output",
          "target": "dndnode_56",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Call"
          },
          "id": "reactflow__edge-dndnode_55output-dndnode_56input",
          "selected": false
        },
        {
          "source": "dndnode_56",
          "sourceHandle": "output",
          "target": "dndnode_58",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Connection"
          },
          "id": "reactflow__edge-dndnode_56output-dndnode_58input"
        },
        {
          "source": "dndnode_58",
          "sourceHandle": "output",
          "target": "dndnode_59",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Connection"
          },
          "id": "reactflow__edge-dndnode_58output-dndnode_59input"
        },
        {
          "source": "dndnode_58",
          "sourceHandle": "output",
          "target": "dndnode_60",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Connection"
          },
          "id": "reactflow__edge-dndnode_58output-dndnode_60input"
        },
        {
          "source": "dndnode_59",
          "sourceHandle": "output",
          "target": "dndnode_61",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Connection"
          },
          "id": "reactflow__edge-dndnode_59output-dndnode_61input"
        },
        {
          "source": "dndnode_60",
          "sourceHandle": "output",
          "target": "dndnode_62",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Connection"
          },
          "id": "reactflow__edge-dndnode_60output-dndnode_62input"
        },
        {
          "source": "dndnode_55",
          "sourceHandle": "output",
          "target": "dndnode_63",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Connection"
          },
          "id": "reactflow__edge-dndnode_55output-dndnode_63input"
        },
        {
          "source": "dndnode_62",
          "sourceHandle": "output",
          "target": "dndnode_64",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Connection"
          },
          "id": "reactflow__edge-dndnode_62output-dndnode_64input"
        },
        {
          "source": "dndnode_62",
          "sourceHandle": "output",
          "target": "dndnode_65",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Connection"
          },
          "id": "reactflow__edge-dndnode_62output-dndnode_65input"
        },
        {
          "source": "dndnode_62",
          "sourceHandle": "output",
          "target": "dndnode_66",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Connection"
          },
          "id": "reactflow__edge-dndnode_62output-dndnode_66input"
        },
        {
          "source": "dndnode_61",
          "sourceHandle": "output",
          "target": "dndnode_67",
          "targetHandle": "input",
          "type": "customEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "Connection"
          },
          "id": "reactflow__edge-dndnode_61output-dndnode_67input"
        }
      ]
    }
  }
];