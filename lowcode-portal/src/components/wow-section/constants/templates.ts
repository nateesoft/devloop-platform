// Template definitions
export const WORKFLOW_TEMPLATES = [
  {
    id: 'view-all',
    name: 'เรียกดูข้อมูลทั้งหมด',
    description: 'Template สำหรับการดึงข้อมูลทั้งหมด',
    nodes: [
      { type: 'httpIn', label: 'HTTP In', position: { x: 50, y: 100 } },
      { type: 'databaseAction', label: 'DB Action', position: { x: 250, y: 100 } },
      { type: 'paginator', label: 'Paginator', position: { x: 450, y: 100 } },
      { type: 'httpResponse', label: 'HTTP Out', position: { x: 650, y: 100 } }
    ]
  },
  {
    id: 'view-by-id',
    name: 'เรียกดูเฉพาะรหัส',
    description: 'Template สำหรับการดึงข้อมูลตาม ID',
    nodes: [
      { type: 'httpIn', label: 'HTTP In', position: { x: 50, y: 100 } },
      { type: 'paramExtract', label: 'Param Extract', position: { x: 200, y: 100 } },
      { type: 'mapper', label: 'Mapper', position: { x: 350, y: 100 } },
      { type: 'databaseAction', label: 'DB Action', position: { x: 500, y: 100 } },
      { type: 'paginator', label: 'Paginator', position: { x: 650, y: 100 } },
      { type: 'httpResponse', label: 'HTTP Out', position: { x: 800, y: 100 } }
    ]
  },
  {
    id: 'search-data',
    name: 'ค้นหาข้อมูล',
    description: 'Template สำหรับการค้นหาข้อมูล',
    nodes: [
      { type: 'httpIn', label: 'HTTP In', position: { x: 50, y: 100 } },
      { type: 'paramExtract', label: 'Param Extract', position: { x: 200, y: 100 } },
      { type: 'mapper', label: 'Mapper', position: { x: 350, y: 100 } },
      { type: 'databaseAction', label: 'DB Action', position: { x: 500, y: 100 } },
      { type: 'paginator', label: 'Paginator', position: { x: 650, y: 100 } },
      { type: 'httpResponse', label: 'HTTP Out', position: { x: 800, y: 100 } }
    ]
  },
  {
    id: 'create-update-data',
    name: 'เพิ่ม/แก้ไขข้อมูล',
    description: 'Template สำหรับการเพิ่มหรือแก้ไขข้อมูล',
    nodes: [
      { type: 'httpIn', label: 'HTTP In', position: { x: 50, y: 100 } },
      { type: 'paramExtract', label: 'Param Extract', position: { x: 200, y: 100 } },
      { type: 'validator', label: 'Validator', position: { x: 350, y: 100 } },
      { type: 'mapper', label: 'Mapper', position: { x: 500, y: 100 } },
      { type: 'databaseAction', label: 'DB Action', position: { x: 650, y: 100 } },
      { type: 'paginator', label: 'Paginator', position: { x: 800, y: 100 } },
      { type: 'httpResponse', label: 'HTTP Out', position: { x: 950, y: 100 } }
    ]
  },
  {
    id: 'delete-data',
    name: 'ลบข้อมูล',
    description: 'Template สำหรับการลบข้อมูล',
    nodes: [
      { type: 'httpIn', label: 'HTTP In', position: { x: 50, y: 100 } },
      { type: 'paramExtract', label: 'Param Extract', position: { x: 200, y: 100 } },
      { type: 'validator', label: 'Validator', position: { x: 350, y: 100 } },
      { type: 'mapper', label: 'Mapper', position: { x: 500, y: 100 } },
      { type: 'databaseAction', label: 'DB Action', position: { x: 650, y: 100 } },
      { type: 'httpResponse', label: 'HTTP Out', position: { x: 800, y: 100 } }
    ]
  }
];