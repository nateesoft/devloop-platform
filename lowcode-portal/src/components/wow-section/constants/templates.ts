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
    id: 'view-all',
    name: 'เรียกดูข้อมูลทั้งหมด(R)',
    description: 'Template สำหรับการดึงข้อมูลทั้งหมด',
    fullTemplate: {
      nodes: [
        {
          "id": "template-node-0",
          "type": "customNode",
          "position": {
            "x": 68.90654329985284,
            "y": 100
          },
          "data": {
            "label": "GET ALL",
            "nodeType": "httpIn",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 1,
            "isFirstNode": true
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 68.90654329985284,
            "y": 100
          },
          "dragging": false
        },
        {
          "id": "template-node-1",
          "type": "customNode",
          "position": {
            "x": 400,
            "y": 100
          },
          "data": {
            "label": "DB Action",
            "nodeType": "databaseAction",
            "style": {
              "background": "#059669",
              "color": "white",
              "border": "2px solid #047857",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 2,
            "isFirstNode": false
          },
          "width": 140,
          "height": 49
        },
        {
          "id": "template-node-2",
          "type": "customNode",
          "position": {
            "x": 737.395637800098,
            "y": 100
          },
          "data": {
            "label": "Paginator",
            "nodeType": "paginator",
            "style": {
              "background": "#059669",
              "color": "white",
              "border": "2px solid #047857",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 3,
            "isFirstNode": false
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 737.395637800098,
            "y": 100
          },
          "dragging": false
        },
        {
          "id": "dndnode_42",
          "type": "customNode",
          "position": {
            "x": 1031.511337730475,
            "y": 102.86617189616317
          },
          "data": {
            "label": "Response",
            "nodeType": "httpResponse",
            "orderNumber": 4,
            "tagLabel": "4",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1031.511337730475,
            "y": 102.86617189616317
          },
          "dragging": false
        }
      ],
      edges: [
        {
          "id": "template-edge-0",
          "source": "template-node-0",
          "target": "template-node-1",
          "sourceHandle": "output-right",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step 1"
          }
        },
        {
          "id": "template-edge-1",
          "source": "template-node-1",
          "target": "template-node-2",
          "sourceHandle": "output-right",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step 2"
          }
        },
        {
          "source": "template-node-2",
          "sourceHandle": "output-right",
          "target": "dndnode_42",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-template-node-2output-right-dndnode_42input-left"
        }
      ]
    }
  },
  {
    id: 'view-by-id',
    name: 'เรียกดูเฉพาะรหัส(R)',
    description: 'Template สำหรับการดึงข้อมูลตาม ID',
    fullTemplate: {
      nodes: [
        {
          "id": "template-node-0",
          "type": "customNode",
          "position": {
            "x": 50,
            "y": 100
          },
          "data": {
            "label": "GET BY ID",
            "nodeType": "httpIn",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 1,
            "isFirstNode": true
          },
          "width": 140,
          "height": 49
        },
        {
          "id": "template-node-1",
          "type": "customNode",
          "position": {
            "x": 350,
            "y": 86.9117291414752
          },
          "data": {
            "label": "Param Extract",
            "nodeType": "paramExtract",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 2,
            "isFirstNode": false
          },
          "width": 140,
          "height": 70,
          "selected": false,
          "positionAbsolute": {
            "x": 350,
            "y": 86.9117291414752
          },
          "dragging": false
        },
        {
          "id": "dndnode_43",
          "type": "customNode",
          "position": {
            "x": 613.6880290205563,
            "y": 95.73518742442562
          },
          "data": {
            "label": "Validator",
            "nodeType": "validator",
            "orderNumber": 3,
            "tagLabel": "3",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 613.6880290205563,
            "y": 95.73518742442562
          },
          "dragging": false
        },
        {
          "id": "dndnode_44",
          "type": "customNode",
          "position": {
            "x": 897.2672309552602,
            "y": 91.37243047158398
          },
          "data": {
            "label": "Mapper",
            "nodeType": "mapper",
            "orderNumber": 4,
            "tagLabel": "4",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 897.2672309552602,
            "y": 91.37243047158398
          },
          "dragging": false
        },
        {
          "id": "dndnode_45",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078596,
            "y": 91.37243047158404
          },
          "data": {
            "label": "DB Action",
            "nodeType": "databaseAction",
            "orderNumber": 5,
            "tagLabel": "5",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078596,
            "y": 91.37243047158404
          },
          "dragging": false
        },
        {
          "id": "dndnode_46",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078596,
            "y": 213.52962515114876
          },
          "data": {
            "label": "Paginator",
            "nodeType": "paginator",
            "orderNumber": 6,
            "tagLabel": "6",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078596,
            "y": 213.52962515114876
          },
          "dragging": false
        },
        {
          "id": "dndnode_47",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078599,
            "y": 348.7750906892382
          },
          "data": {
            "label": "Response",
            "nodeType": "httpResponse",
            "orderNumber": 7,
            "tagLabel": "7",
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
          "width": 140,
          "height": 49,
          "selected": true,
          "positionAbsolute": {
            "x": 1169.9395405078599,
            "y": 348.7750906892382
          },
          "dragging": false
        }
      ],
      edges: [
        {
          "id": "template-edge-0",
          "source": "template-node-0",
          "target": "template-node-1",
          "sourceHandle": "output-right",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step 1"
          }
        },
        {
          "source": "template-node-1",
          "sourceHandle": "output-right",
          "target": "dndnode_43",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-template-node-1output-right-dndnode_43input-left"
        },
        {
          "source": "dndnode_43",
          "sourceHandle": "output-right",
          "target": "dndnode_44",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_43output-right-dndnode_44input-left"
        },
        {
          "source": "dndnode_44",
          "sourceHandle": "output-right",
          "target": "dndnode_45",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_44output-right-dndnode_45input-left"
        },
        {
          "source": "dndnode_45",
          "sourceHandle": "output-bottom",
          "target": "dndnode_46",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_45output-bottom-dndnode_46input-top"
        },
        {
          "source": "dndnode_46",
          "sourceHandle": "output-bottom",
          "target": "dndnode_47",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_46output-bottom-dndnode_47input-top"
        }
      ]
    }
  },
  {
    id: 'search-data',
    name: 'ค้นหาข้อมูล(R)',
    description: 'Template สำหรับการค้นหาข้อมูล',
    fullTemplate: {
      nodes: [
        {
          "id": "template-node-0",
          "type": "customNode",
          "position": {
            "x": 50,
            "y": 100
          },
          "data": {
            "label": "SEARCH",
            "nodeType": "httpIn",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 1,
            "isFirstNode": true
          },
          "width": 140,
          "height": 49,
          "selected": true,
          "dragging": false
        },
        {
          "id": "template-node-1",
          "type": "customNode",
          "position": {
            "x": 350,
            "y": 86.9117291414752
          },
          "data": {
            "label": "Param Extract",
            "nodeType": "paramExtract",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 2,
            "isFirstNode": false
          },
          "width": 140,
          "height": 70,
          "selected": false,
          "positionAbsolute": {
            "x": 350,
            "y": 86.9117291414752
          },
          "dragging": false
        },
        {
          "id": "dndnode_43",
          "type": "customNode",
          "position": {
            "x": 613.6880290205563,
            "y": 95.73518742442562
          },
          "data": {
            "label": "Validator",
            "nodeType": "validator",
            "orderNumber": 3,
            "tagLabel": "3",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 613.6880290205563,
            "y": 95.73518742442562
          },
          "dragging": false
        },
        {
          "id": "dndnode_44",
          "type": "customNode",
          "position": {
            "x": 897.2672309552602,
            "y": 91.37243047158398
          },
          "data": {
            "label": "Mapper",
            "nodeType": "mapper",
            "orderNumber": 4,
            "tagLabel": "4",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 897.2672309552602,
            "y": 91.37243047158398
          },
          "dragging": false
        },
        {
          "id": "dndnode_45",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078596,
            "y": 91.37243047158404
          },
          "data": {
            "label": "DB Action",
            "nodeType": "databaseAction",
            "orderNumber": 5,
            "tagLabel": "5",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078596,
            "y": 91.37243047158404
          },
          "dragging": false
        },
        {
          "id": "dndnode_46",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078596,
            "y": 213.52962515114876
          },
          "data": {
            "label": "Paginator",
            "nodeType": "paginator",
            "orderNumber": 6,
            "tagLabel": "6",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078596,
            "y": 213.52962515114876
          },
          "dragging": false
        },
        {
          "id": "dndnode_47",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078599,
            "y": 348.7750906892382
          },
          "data": {
            "label": "Response",
            "nodeType": "httpResponse",
            "orderNumber": 7,
            "tagLabel": "7",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078599,
            "y": 348.7750906892382
          },
          "dragging": false
        }
      ],
      edges: [
        {
          "id": "template-edge-0",
          "source": "template-node-0",
          "target": "template-node-1",
          "sourceHandle": "output-right",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step 1"
          }
        },
        {
          "source": "template-node-1",
          "sourceHandle": "output-right",
          "target": "dndnode_43",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-template-node-1output-right-dndnode_43input-left"
        },
        {
          "source": "dndnode_43",
          "sourceHandle": "output-right",
          "target": "dndnode_44",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_43output-right-dndnode_44input-left"
        },
        {
          "source": "dndnode_44",
          "sourceHandle": "output-right",
          "target": "dndnode_45",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_44output-right-dndnode_45input-left"
        },
        {
          "source": "dndnode_45",
          "sourceHandle": "output-bottom",
          "target": "dndnode_46",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_45output-bottom-dndnode_46input-top"
        },
        {
          "source": "dndnode_46",
          "sourceHandle": "output-bottom",
          "target": "dndnode_47",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_46output-bottom-dndnode_47input-top"
        }
      ]
    }
  },
  {
    id: 'create-update-data',
    name: 'เพิ่ม/แก้ไขข้อมูล(C/U)',
    description: 'Template สำหรับการเพิ่มหรือแก้ไขข้อมูล',
    fullTemplate: {
      nodes: [
        {
          "id": "template-node-0",
          "type": "customNode",
          "position": {
            "x": 50,
            "y": 100
          },
          "data": {
            "label": "CREATE/UPDATE",
            "nodeType": "httpIn",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 1,
            "isFirstNode": true,
            "tagLabel": "2"
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "dragging": false
        },
        {
          "id": "template-node-1",
          "type": "customNode",
          "position": {
            "x": 350,
            "y": 86.9117291414752
          },
          "data": {
            "label": "Param Extract",
            "nodeType": "paramExtract",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 2,
            "isFirstNode": false,
            "tagLabel": "3"
          },
          "width": 140,
          "height": 70,
          "selected": false,
          "positionAbsolute": {
            "x": 350,
            "y": 86.9117291414752
          },
          "dragging": false
        },
        {
          "id": "dndnode_43",
          "type": "customNode",
          "position": {
            "x": 613.6880290205563,
            "y": 95.73518742442562
          },
          "data": {
            "label": "Validator",
            "nodeType": "validator",
            "orderNumber": 3,
            "tagLabel": "4",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 613.6880290205563,
            "y": 95.73518742442562
          },
          "dragging": false
        },
        {
          "id": "dndnode_44",
          "type": "customNode",
          "position": {
            "x": 897.2672309552602,
            "y": 91.37243047158398
          },
          "data": {
            "label": "Mapper",
            "nodeType": "mapper",
            "orderNumber": 4,
            "tagLabel": "5",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 897.2672309552602,
            "y": 91.37243047158398
          },
          "dragging": false
        },
        {
          "id": "dndnode_45",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078596,
            "y": 91.37243047158404
          },
          "data": {
            "label": "DB Action",
            "nodeType": "databaseAction",
            "orderNumber": 5,
            "tagLabel": "6",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078596,
            "y": 91.37243047158404
          },
          "dragging": false
        },
        {
          "id": "dndnode_46",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078596,
            "y": 213.52962515114876
          },
          "data": {
            "label": "Paginator",
            "nodeType": "paginator",
            "orderNumber": 6,
            "tagLabel": "7",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078596,
            "y": 213.52962515114876
          },
          "dragging": false
        },
        {
          "id": "dndnode_47",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078599,
            "y": 348.7750906892382
          },
          "data": {
            "label": "Response",
            "nodeType": "httpResponse",
            "orderNumber": 7,
            "tagLabel": "8",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078599,
            "y": 348.7750906892382
          },
          "dragging": false
        },
        {
          "id": "dndnode_48",
          "type": "customNode",
          "position": {
            "x": -190.1552059067816,
            "y": 100.56763963633182
          },
          "data": {
            "label": "Auth",
            "nodeType": "authentication",
            "orderNumber": 8,
            "tagLabel": "1",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": -190.1552059067816,
            "y": 100.56763963633182
          },
          "dragging": false
        }
      ],
      edges: [
        {
          "id": "template-edge-0",
          "source": "template-node-0",
          "target": "template-node-1",
          "sourceHandle": "output-right",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step 1"
          }
        },
        {
          "source": "template-node-1",
          "sourceHandle": "output-right",
          "target": "dndnode_43",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-template-node-1output-right-dndnode_43input-left"
        },
        {
          "source": "dndnode_43",
          "sourceHandle": "output-right",
          "target": "dndnode_44",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_43output-right-dndnode_44input-left"
        },
        {
          "source": "dndnode_44",
          "sourceHandle": "output-right",
          "target": "dndnode_45",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_44output-right-dndnode_45input-left"
        },
        {
          "source": "dndnode_45",
          "sourceHandle": "output-bottom",
          "target": "dndnode_46",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_45output-bottom-dndnode_46input-top"
        },
        {
          "source": "dndnode_46",
          "sourceHandle": "output-bottom",
          "target": "dndnode_47",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_46output-bottom-dndnode_47input-top"
        },
        {
          "source": "dndnode_48",
          "sourceHandle": "output-right",
          "target": "template-node-0",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_48output-right-template-node-0input-left"
        }
      ]
    }
  },
  {
    id: 'delete-data',
    name: 'ลบข้อมูล(D)',
    description: 'Template สำหรับการลบข้อมูล',
    fullTemplate: {
      nodes: [
        {
          "id": "template-node-0",
          "type": "customNode",
          "position": {
            "x": 50,
            "y": 100
          },
          "data": {
            "label": "DELETE",
            "nodeType": "httpIn",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 1,
            "isFirstNode": true,
            "tagLabel": "2"
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "dragging": false
        },
        {
          "id": "template-node-1",
          "type": "customNode",
          "position": {
            "x": 350,
            "y": 86.9117291414752
          },
          "data": {
            "label": "Param Extract",
            "nodeType": "paramExtract",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            },
            "orderNumber": 2,
            "isFirstNode": false,
            "tagLabel": "3"
          },
          "width": 140,
          "height": 70,
          "selected": false,
          "positionAbsolute": {
            "x": 350,
            "y": 86.9117291414752
          },
          "dragging": false
        },
        {
          "id": "dndnode_43",
          "type": "customNode",
          "position": {
            "x": 613.6880290205563,
            "y": 95.73518742442562
          },
          "data": {
            "label": "Validator",
            "nodeType": "validator",
            "orderNumber": 3,
            "tagLabel": "4",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 613.6880290205563,
            "y": 95.73518742442562
          },
          "dragging": false
        },
        {
          "id": "dndnode_44",
          "type": "customNode",
          "position": {
            "x": 897.2672309552602,
            "y": 91.37243047158398
          },
          "data": {
            "label": "Mapper",
            "nodeType": "mapper",
            "orderNumber": 4,
            "tagLabel": "5",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 897.2672309552602,
            "y": 91.37243047158398
          },
          "dragging": false
        },
        {
          "id": "dndnode_45",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078596,
            "y": 91.37243047158404
          },
          "data": {
            "label": "DB Action",
            "nodeType": "databaseAction",
            "orderNumber": 5,
            "tagLabel": "6",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078596,
            "y": 91.37243047158404
          },
          "dragging": false
        },
        {
          "id": "dndnode_46",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078596,
            "y": 213.52962515114876
          },
          "data": {
            "label": "Paginator",
            "nodeType": "paginator",
            "orderNumber": 6,
            "tagLabel": "7",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078596,
            "y": 213.52962515114876
          },
          "dragging": false
        },
        {
          "id": "dndnode_47",
          "type": "customNode",
          "position": {
            "x": 1169.9395405078599,
            "y": 348.7750906892382
          },
          "data": {
            "label": "Response",
            "nodeType": "httpResponse",
            "orderNumber": 7,
            "tagLabel": "8",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1169.9395405078599,
            "y": 348.7750906892382
          },
          "dragging": false
        },
        {
          "id": "dndnode_48",
          "type": "customNode",
          "position": {
            "x": -190.1552059067816,
            "y": 100.56763963633182
          },
          "data": {
            "label": "Auth",
            "nodeType": "authentication",
            "orderNumber": 8,
            "tagLabel": "1",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": -190.1552059067816,
            "y": 100.56763963633182
          },
          "dragging": false
        }
      ],
      edges: [
        {
          "id": "template-edge-0",
          "source": "template-node-0",
          "target": "template-node-1",
          "sourceHandle": "output-right",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step 1"
          }
        },
        {
          "source": "template-node-1",
          "sourceHandle": "output-right",
          "target": "dndnode_43",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-template-node-1output-right-dndnode_43input-left"
        },
        {
          "source": "dndnode_43",
          "sourceHandle": "output-right",
          "target": "dndnode_44",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_43output-right-dndnode_44input-left"
        },
        {
          "source": "dndnode_44",
          "sourceHandle": "output-right",
          "target": "dndnode_45",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_44output-right-dndnode_45input-left"
        },
        {
          "source": "dndnode_45",
          "sourceHandle": "output-bottom",
          "target": "dndnode_46",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_45output-bottom-dndnode_46input-top"
        },
        {
          "source": "dndnode_46",
          "sourceHandle": "output-bottom",
          "target": "dndnode_47",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_46output-bottom-dndnode_47input-top"
        },
        {
          "source": "dndnode_48",
          "sourceHandle": "output-right",
          "target": "template-node-0",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_48output-right-template-node-0input-left"
        }
      ]
    }
  },
  {
    id: 'separate',
    name: '────────────',
  },
  {
    id: 'crud-template',
    name: 'ทุกรายการ(CRUD)',
    description: 'Template CRUD เต็มรูปแบบ',
    fullTemplate: {
      nodes: [
        {
          "id": "dndnode_30",
          "type": "customNode",
          "position": {
            "x": 257.18904109589045,
            "y": 65.14373097547119
          },
          "data": {
            "label": "GET ALL",
            "nodeType": "httpIn",
            "orderNumber": 1,
            "tagLabel": "1",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 257.18904109589045,
            "y": 65.14373097547119
          },
          "dragging": false
        },
        {
          "id": "dndnode_31",
          "type": "customNode",
          "position": {
            "x": 258.6356164383562,
            "y": 157.72455289327942
          },
          "data": {
            "label": "GET BY ID",
            "nodeType": "httpIn",
            "orderNumber": 2,
            "tagLabel": "2",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 258.6356164383562,
            "y": 157.72455289327942
          },
          "dragging": false
        },
        {
          "id": "dndnode_32",
          "type": "customNode",
          "position": {
            "x": 257.1890410958904,
            "y": 247.41222412615616
          },
          "data": {
            "label": "SEARCH",
            "nodeType": "httpIn",
            "orderNumber": 3,
            "tagLabel": "3",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 257.1890410958904,
            "y": 247.41222412615616
          },
          "dragging": false
        },
        {
          "id": "dndnode_33",
          "type": "customNode",
          "position": {
            "x": 27.183561643835503,
            "y": 367.4779775508137
          },
          "data": {
            "label": "Auth",
            "nodeType": "authentication",
            "orderNumber": 4,
            "tagLabel": "4",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 27.183561643835503,
            "y": 367.4779775508137
          },
          "dragging": false
        },
        {
          "id": "dndnode_34",
          "type": "customNode",
          "position": {
            "x": 262.97534246575333,
            "y": 368.92455289327944
          },
          "data": {
            "label": "CREATE/UPDATE",
            "nodeType": "httpIn",
            "orderNumber": 5,
            "tagLabel": "5",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 262.97534246575333,
            "y": 368.92455289327944
          },
          "dragging": false
        },
        {
          "id": "dndnode_35",
          "type": "customNode",
          "position": {
            "x": 261.5287671232876,
            "y": 473.0779775508137
          },
          "data": {
            "label": "DELETE",
            "nodeType": "httpIn",
            "orderNumber": 6,
            "tagLabel": "6",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 261.5287671232876,
            "y": 473.0779775508137
          },
          "dragging": false
        },
        {
          "id": "dndnode_36",
          "type": "customNode",
          "position": {
            "x": 550.8438356164384,
            "y": 147.59852549601914
          },
          "data": {
            "label": "Param Extract",
            "nodeType": "paramExtract",
            "orderNumber": 7,
            "tagLabel": "7",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 70,
          "selected": false,
          "positionAbsolute": {
            "x": 550.8438356164384,
            "y": 147.59852549601914
          },
          "dragging": false
        },
        {
          "id": "dndnode_37",
          "type": "customNode",
          "position": {
            "x": 801.1013698630137,
            "y": 157.7245528932794
          },
          "data": {
            "label": "Validator",
            "nodeType": "validator",
            "orderNumber": 8,
            "tagLabel": "8",
            "style": {
              "background": "#3B82F6",
              "color": "white",
              "border": "2px solid #1D4ED8",
              "borderRadius": "10px",
              "fontSize": "14px",
              "fontWeight": "bold",
              "width": 140,
              "textAlign": "center"
            }
          },
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 801.1013698630137,
            "y": 157.7245528932794
          },
          "dragging": false
        },
        {
          "id": "dndnode_38",
          "type": "customNode",
          "position": {
            "x": 1057.1452054794522,
            "y": 159.17112823574516
          },
          "data": {
            "label": "Mapper",
            "nodeType": "mapper",
            "orderNumber": 9,
            "tagLabel": "9",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1057.1452054794522,
            "y": 159.17112823574516
          },
          "dragging": false
        },
        {
          "id": "dndnode_39",
          "type": "customNode",
          "position": {
            "x": 1320.4219178082194,
            "y": 159.17112823574516
          },
          "data": {
            "label": "DB Action",
            "nodeType": "databaseAction",
            "orderNumber": 10,
            "tagLabel": "10",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1320.4219178082194,
            "y": 159.17112823574516
          },
          "dragging": false
        },
        {
          "id": "dndnode_40",
          "type": "customNode",
          "position": {
            "x": 1320.1866629648248,
            "y": 295.61583751497955
          },
          "data": {
            "label": "Paginator",
            "nodeType": "paginator",
            "orderNumber": 11,
            "tagLabel": "11",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1320.1866629648248,
            "y": 295.61583751497955
          },
          "dragging": false
        },
        {
          "id": "dndnode_41",
          "type": "customNode",
          "position": {
            "x": 1318.6384097243615,
            "y": 430.3138694353231
          },
          "data": {
            "label": "HTTP Out",
            "nodeType": "httpResponse",
            "orderNumber": 12,
            "tagLabel": "12",
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
          "width": 140,
          "height": 49,
          "selected": false,
          "positionAbsolute": {
            "x": 1318.6384097243615,
            "y": 430.3138694353231
          },
          "dragging": false
        }
      ],
      edges: [
        {
          "source": "dndnode_31",
          "sourceHandle": "output-right",
          "target": "dndnode_36",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_31output-right-dndnode_36input-left"
        },
        {
          "source": "dndnode_32",
          "sourceHandle": "output-right",
          "target": "dndnode_36",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_32output-right-dndnode_36input-left"
        },
        {
          "source": "dndnode_33",
          "sourceHandle": "output-right",
          "target": "dndnode_34",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_33output-right-dndnode_34input-left"
        },
        {
          "source": "dndnode_33",
          "sourceHandle": "output-right",
          "target": "dndnode_35",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_33output-right-dndnode_35input-left"
        },
        {
          "source": "dndnode_36",
          "sourceHandle": "output-right",
          "target": "dndnode_37",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_36output-right-dndnode_37input-left"
        },
        {
          "source": "dndnode_37",
          "sourceHandle": "output-right",
          "target": "dndnode_38",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_37output-right-dndnode_38input-left"
        },
        {
          "source": "dndnode_30",
          "sourceHandle": "output-right",
          "target": "dndnode_39",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_30output-right-dndnode_39input-top"
        },
        {
          "source": "dndnode_38",
          "sourceHandle": "output-right",
          "target": "dndnode_39",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_38output-right-dndnode_39input-left"
        },
        {
          "source": "dndnode_34",
          "sourceHandle": "output-right",
          "target": "dndnode_36",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_34output-right-dndnode_36input-left"
        },
        {
          "source": "dndnode_35",
          "sourceHandle": "output-right",
          "target": "dndnode_36",
          "targetHandle": "input-left",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_35output-right-dndnode_36input-left"
        },
        {
          "source": "dndnode_39",
          "sourceHandle": "output-bottom",
          "target": "dndnode_40",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_39output-bottom-dndnode_40input-top"
        },
        {
          "source": "dndnode_40",
          "sourceHandle": "output-bottom",
          "target": "dndnode_41",
          "targetHandle": "input-top",
          "type": "stepEdge",
          "markerEnd": {
            "type": "arrowclosed"
          },
          "data": {
            "label": "step"
          },
          "id": "reactflow__edge-dndnode_40output-bottom-dndnode_41input-top"
        }
      ]
    }
  }
];