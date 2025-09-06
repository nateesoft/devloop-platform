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
    nodes: [
      { type: 'httpIn', label: 'GET ALL', position: { x: 50, y: 100 } },
      { type: 'databaseAction', label: 'DB Action', position: { x: 250, y: 100 } },
      { type: 'paginator', label: 'Paginator', position: { x: 450, y: 100 } },
      { type: 'httpResponse', label: 'Response', position: { x: 650, y: 100 } }
    ]
  },
  {
    id: 'view-by-id',
    name: 'เรียกดูเฉพาะรหัส(R)',
    description: 'Template สำหรับการดึงข้อมูลตาม ID',
    nodes: [
      { type: 'httpIn', label: 'GET BY ID', position: { x: 50, y: 100 } },
      { type: 'paramExtract', label: 'Param Extract', position: { x: 200, y: 100 } },
      { type: 'mapper', label: 'Mapper', position: { x: 350, y: 100 } },
      { type: 'databaseAction', label: 'DB Action', position: { x: 500, y: 100 } },
      { type: 'paginator', label: 'Paginator', position: { x: 650, y: 100 } },
      { type: 'httpResponse', label: 'Response', position: { x: 800, y: 100 } }
    ]
  },
  {
    id: 'search-data',
    name: 'ค้นหาข้อมูล(R)',
    description: 'Template สำหรับการค้นหาข้อมูล',
    nodes: [
      { type: 'httpIn', label: 'SEARCH', position: { x: 50, y: 100 } },
      { type: 'paramExtract', label: 'Param Extract', position: { x: 200, y: 100 } },
      { type: 'mapper', label: 'Mapper', position: { x: 350, y: 100 } },
      { type: 'databaseAction', label: 'DB Action', position: { x: 500, y: 100 } },
      { type: 'paginator', label: 'Paginator', position: { x: 650, y: 100 } },
      { type: 'httpResponse', label: 'Response', position: { x: 800, y: 100 } }
    ]
  },
  {
    id: 'create-update-data',
    name: 'เพิ่ม/แก้ไขข้อมูล(C/U)',
    description: 'Template สำหรับการเพิ่มหรือแก้ไขข้อมูล',
    nodes: [
      { type: 'httpIn', label: 'CREATE/UPDATE', position: { x: 50, y: 100 } },
      { type: 'paramExtract', label: 'Param Extract', position: { x: 200, y: 100 } },
      { type: 'validator', label: 'Validator', position: { x: 350, y: 100 } },
      { type: 'mapper', label: 'Mapper', position: { x: 500, y: 100 } },
      { type: 'databaseAction', label: 'DB Action', position: { x: 650, y: 100 } },
      { type: 'paginator', label: 'Paginator', position: { x: 800, y: 100 } },
      { type: 'httpResponse', label: 'Response', position: { x: 950, y: 100 } }
    ]
  },
  {
    id: 'delete-data',
    name: 'ลบข้อมูล(D)',
    description: 'Template สำหรับการลบข้อมูล',
    nodes: [
      { type: 'httpIn', label: 'DELETE', position: { x: 50, y: 100 } },
      { type: 'paramExtract', label: 'Param Extract', position: { x: 200, y: 100 } },
      { type: 'validator', label: 'Validator', position: { x: 350, y: 100 } },
      { type: 'mapper', label: 'Mapper', position: { x: 500, y: 100 } },
      { type: 'databaseAction', label: 'DB Action', position: { x: 650, y: 100 } },
      { type: 'httpResponse', label: 'Response', position: { x: 800, y: 100 } }
    ]
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