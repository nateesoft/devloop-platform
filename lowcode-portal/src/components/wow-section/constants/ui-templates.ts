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
          "id": "dndnode_43",
          "type": "customNode",
          "position": {
            "x": 140.33615824340177,
            "y": -33.58506420269646
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
            }
          },
          "width": 92,
          "height": 128,
          "selected": false,
          "positionAbsolute": {
            "x": 140.33615824340177,
            "y": -33.58506420269646
          },
          "dragging": false
        },
        {
          "id": "dndnode_44",
          "type": "customNode",
          "position": {
            "x": 351.2692493518688,
            "y": -37.54005966098026
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
            }
          },
          "width": 132,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 351.2692493518688,
            "y": -37.54005966098026
          },
          "dragging": false
        },
        {
          "id": "dndnode_45",
          "type": "customNode",
          "position": {
            "x": 761.2784565579408,
            "y": -120.94763455483235
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
            }
          },
          "width": 103,
          "height": 128,
          "selected": false,
          "positionAbsolute": {
            "x": 761.2784565579408,
            "y": -120.94763455483235
          },
          "dragging": false
        },
        {
          "id": "dndnode_46",
          "type": "customNode",
          "position": {
            "x": 760.4807667580083,
            "y": 35.93385195708976
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
            }
          },
          "width": 108,
          "height": 128,
          "selected": false,
          "positionAbsolute": {
            "x": 760.4807667580083,
            "y": 35.93385195708976
          },
          "dragging": false
        },
        {
          "id": "dndnode_47",
          "type": "customNode",
          "position": {
            "x": 1019.0317885325278,
            "y": -125.92648323870816
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
            }
          },
          "width": 132,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1019.0317885325278,
            "y": -125.92648323870816
          },
          "dragging": false
        },
        {
          "id": "dndnode_48",
          "type": "customNode",
          "position": {
            "x": 1023.4363030075872,
            "y": 29.476711068173813
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
            }
          },
          "width": 132,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1023.4363030075872,
            "y": 29.476711068173813
          },
          "dragging": false
        },
        {
          "id": "dndnode_49",
          "type": "customNode",
          "position": {
            "x": 565.4272572441535,
            "y": -23.995355790108135
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
            }
          },
          "width": 100,
          "height": 100,
          "selected": false,
          "positionAbsolute": {
            "x": 565.4272572441535,
            "y": -23.995355790108135
          },
          "dragging": false
        },
        {
          "id": "dndnode_50",
          "type": "customNode",
          "position": {
            "x": 361.56500234695363,
            "y": 154.80186776727214
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
            }
          },
          "width": 132,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 361.56500234695363,
            "y": 154.80186776727214
          },
          "dragging": false
        },
        {
          "id": "dndnode_51",
          "type": "customNode",
          "position": {
            "x": 1024.8662696449767,
            "y": 315.7001362569847
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
            }
          },
          "width": 145,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1024.8662696449767,
            "y": 315.7001362569847
          },
          "dragging": false
        },
        {
          "id": "dndnode_52",
          "type": "customNode",
          "position": {
            "x": 1007.5748169286926,
            "y": -291.57590876478974
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
            }
          },
          "width": 157,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1007.5748169286926,
            "y": -291.57590876478974
          },
          "dragging": false
        },
        {
          "id": "dndnode_53",
          "type": "customNode",
          "position": {
            "x": 1018.6725864430475,
            "y": 465.08412885041366
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
            }
          },
          "width": 157,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1018.6725864430475,
            "y": 465.08412885041366
          },
          "dragging": false
        },
        {
          "id": "dndnode_54",
          "type": "customNode",
          "position": {
            "x": 1009.3457083197547,
            "y": 181.37350114880894
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
            }
          },
          "width": 173,
          "height": 136,
          "selected": false,
          "positionAbsolute": {
            "x": 1009.3457083197547,
            "y": 181.37350114880894
          },
          "dragging": false
        }
      ],
      edges: [
        {
          "source": "dndnode_43",
          "sourceHandle": "output",
          "target": "dndnode_44",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_43output-dndnode_44input"
        },
        {
          "source": "dndnode_45",
          "sourceHandle": "output",
          "target": "dndnode_47",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_45output-dndnode_47input"
        },
        {
          "source": "dndnode_46",
          "sourceHandle": "output",
          "target": "dndnode_48",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_46output-dndnode_48input"
        },
        {
          "source": "dndnode_44",
          "sourceHandle": "output",
          "target": "dndnode_49",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_44output-dndnode_49input"
        },
        {
          "source": "dndnode_49",
          "sourceHandle": "output",
          "target": "dndnode_45",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_49output-dndnode_45input"
        },
        {
          "source": "dndnode_49",
          "sourceHandle": "output",
          "target": "dndnode_46",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_49output-dndnode_46input"
        },
        {
          "source": "dndnode_43",
          "sourceHandle": "output",
          "target": "dndnode_50",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_43output-dndnode_50input"
        },
        {
          "source": "dndnode_46",
          "sourceHandle": "output",
          "target": "dndnode_51",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_46output-dndnode_51input"
        },
        {
          "source": "dndnode_45",
          "sourceHandle": "output",
          "target": "dndnode_52",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_45output-dndnode_52input"
        },
        {
          "source": "dndnode_46",
          "sourceHandle": "output",
          "target": "dndnode_53",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_46output-dndnode_53input"
        },
        {
          "source": "dndnode_46",
          "sourceHandle": "output",
          "target": "dndnode_54",
          "targetHandle": "input",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "id": "reactflow__edge-dndnode_46output-dndnode_54input"
        }
      ]
    }
  }
];