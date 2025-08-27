import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Plus,
  Save,
  Download,
  Upload,
  Trash2,
  Edit3,
  Copy,
  FileJson,
  Database,
  Settings,
  GitBranch,
  Layers,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  EyeOff
} from 'lucide-react';

interface DataObject {
  id: string;
  name: string;
  type: 'constant' | 'array' | 'object' | 'enum' | 'config';
  description?: string;
  value: any;
  connections: string[];
  category?: string;
  isVisible: boolean;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
    tags: string[];
  };
}

interface DataDiagramViewProps {
  className?: string;
}

const DataDiagramView: React.FC<DataDiagramViewProps> = ({ className = '' }) => {
  const [dataObjects, setDataObjects] = useState<DataObject[]>([
    {
      id: 'sample_1',
      name: 'App Config',
      type: 'config',
      description: 'Main application configuration settings',
      value: {
        appName: 'TON Low-Code Platform',
        version: '1.0.0',
        environment: 'production',
        features: {
          darkMode: true,
          notifications: true,
          analytics: false
        }
      },
      connections: [],
      category: 'Configuration',
      isVisible: true,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: ['config', 'app', 'settings']
      }
    },
    {
      id: 'sample_2',
      name: 'API Endpoints',
      type: 'constant',
      description: 'Backend API endpoints configuration',
      value: {
        baseURL: 'https://api.tonplatform.com',
        auth: '/auth',
        users: '/users',
        projects: '/projects',
        components: '/components'
      },
      connections: [],
      category: 'API',
      isVisible: true,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: ['api', 'endpoints', 'backend']
      }
    },
    {
      id: 'sample_3',
      name: 'User Roles',
      type: 'enum',
      description: 'Available user roles in the system',
      value: ['admin', 'user', 'viewer', 'editor'],
      connections: [],
      category: 'Authorization',
      isVisible: true,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: ['auth', 'roles', 'permissions']
      }
    },
    {
      id: 'sample_4',
      name: 'Component Types',
      type: 'array',
      description: 'Available component types for low-code builder',
      value: [
        { type: 'button', category: 'Input' },
        { type: 'text', category: 'Display' },
        { type: 'form', category: 'Input' },
        { type: 'table', category: 'Display' },
        { type: 'chart', category: 'Visualization' }
      ],
      connections: [],
      category: 'Components',
      isVisible: true,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: ['components', 'builder', 'types']
      }
    }
  ]);
  const [selectedObject, setSelectedObject] = useState<DataObject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showConnections, setShowConnections] = useState(true);
  const [editingObject, setEditingObject] = useState<DataObject | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Update editing object when selected object changes
  useEffect(() => {
    if (selectedObject && isEditing) {
      const currentObject = dataObjects.find(obj => obj.id === selectedObject.id);
      setEditingObject(currentObject || null);
    }
  }, [selectedObject, isEditing, dataObjects]);

  const objectTypes = [
    { value: 'constant', label: 'Constant', icon: Database, color: 'bg-blue-500' },
    { value: 'array', label: 'Array', icon: List, color: 'bg-green-500' },
    { value: 'object', label: 'Object', icon: GitBranch, color: 'bg-purple-500' },
    { value: 'enum', label: 'Enum', icon: Layers, color: 'bg-orange-500' },
    { value: 'config', label: 'Config', icon: Settings, color: 'bg-red-500' }
  ];

  const filteredObjects = dataObjects.filter(obj => {
    const matchesSearch = obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         obj.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || obj.type === filterType;
    return matchesSearch && matchesType && obj.isVisible;
  });

  const createNewObject = useCallback(() => {
    const newObject: DataObject = {
      id: `obj_${Date.now()}`,
      name: 'New Object',
      type: 'constant',
      description: '',
      value: '',
      connections: [],
      isVisible: true,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: []
      }
    };
    setDataObjects(prev => [...prev, newObject]);
    setSelectedObject(newObject);
    setIsEditing(true);
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<DataObject>) => {
    setDataObjects(prev => prev.map(obj => 
      obj.id === id 
        ? { 
            ...obj, 
            ...updates,
            metadata: {
              createdAt: obj.metadata?.createdAt || new Date(),
              updatedAt: new Date(),
              version: (obj.metadata?.version || 1) + 1,
              tags: obj.metadata?.tags || []
            }
          }
        : obj
    ));
  }, []);

  const deleteObject = useCallback((id: string) => {
    setDataObjects(prev => prev.filter(obj => obj.id !== id));
    if (selectedObject?.id === id) {
      setSelectedObject(null);
      setIsEditing(false);
    }
  }, [selectedObject]);

  const duplicateObject = useCallback((id: string) => {
    setDataObjects(prev => {
      const originalObject = prev.find(obj => obj.id === id);
      if (originalObject) {
        const duplicatedObject: DataObject = {
          ...originalObject,
          id: `obj_${Date.now()}`,
          name: `${originalObject.name} (Copy)`,
          connections: [],
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            tags: [...(originalObject.metadata?.tags || [])]
          }
        };
        return [...prev, duplicatedObject];
      }
      return prev;
    });
  }, []);

  const exportData = useCallback(() => {
    setDataObjects(currentObjects => {
      const dataToExport = {
        objects: currentObjects,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-diagram-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return currentObjects;
    });
  }, []);

  const importData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const importedData = JSON.parse(result);
          if (importedData.objects && Array.isArray(importedData.objects)) {
            setDataObjects(importedData.objects);
          }
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const renderObjectCard = (obj: DataObject) => {
    const TypeIcon = objectTypes.find(type => type.value === obj.type)?.icon || Database;
    const typeColor = objectTypes.find(type => type.value === obj.type)?.color || 'bg-gray-500';

    return (
      <div
        key={obj.id}
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
          selectedObject?.id === obj.id ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{}}
        onClick={() => setSelectedObject(obj)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${typeColor} rounded-full flex items-center justify-center text-white`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{obj.name}</h3>
              <span className="text-xs text-slate-500 capitalize">{obj.type}</span>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject(obj);
                setIsEditing(true);
              }}
              className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
            >
              <Edit3 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateObject(obj.id);
              }}
              className="p-1 text-slate-400 hover:text-green-500 transition-colors"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteObject(obj.id);
              }}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        {obj.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">
            {obj.description}
          </p>
        )}
        
        <div className="bg-slate-50 dark:bg-slate-700 rounded p-2 text-xs">
          <pre className="whitespace-pre-wrap break-all max-h-20 overflow-y-auto">
            {typeof obj.value === 'object' 
              ? JSON.stringify(obj.value, null, 2)
              : String(obj.value)
            }
          </pre>
        </div>

        {obj.metadata && (
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>v{obj.metadata.version}</span>
            <span>{obj.metadata.updatedAt.toLocaleDateString()}</span>
          </div>
        )}
      </div>
    );
  };

  const renderEditPanel = () => {
    if (!editingObject || !isEditing) return null;

    return (
      <>
        {/* Backdrop for mobile */}
        <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={() => setIsEditing(false)} />
        
        {/* Edit Panel */}
        <div className="fixed inset-0 sm:right-0 sm:left-auto sm:top-0 h-full w-full sm:w-80 bg-white dark:bg-slate-800 sm:border-l border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Edit Object</h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={editingObject?.name || ''}
              onChange={(e) => setEditingObject(prev => prev ? {...prev, name: e.target.value} : null)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type
            </label>
            <select
              value={editingObject?.type || 'constant'}
              onChange={(e) => setEditingObject(prev => prev ? {...prev, type: e.target.value as DataObject['type']} : null)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              {objectTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={editingObject?.description || ''}
              onChange={(e) => setEditingObject(prev => prev ? {...prev, description: e.target.value} : null)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Value
            </label>
            <textarea
              value={editingObject ? (typeof editingObject.value === 'object' 
                ? JSON.stringify(editingObject.value, null, 2)
                : String(editingObject.value)) : ''
              }
              onChange={(e) => {
                if (!editingObject) return;
                try {
                  const parsedValue = JSON.parse(e.target.value);
                  setEditingObject(prev => prev ? {...prev, value: parsedValue} : null);
                } catch {
                  setEditingObject(prev => prev ? {...prev, value: e.target.value} : null);
                }
              }}
              rows={8}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={editingObject?.category || ''}
              onChange={(e) => setEditingObject(prev => prev ? {...prev, category: e.target.value} : null)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="e.g., Configuration, Constants, API"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingObject(null);
              }}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (editingObject) {
                  updateObject(editingObject.id, editingObject);
                }
                setIsEditing(false);
                setEditingObject(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      </>
    );
  };

  return (
    <div className={`min-h-[80vh] bg-slate-50 dark:bg-slate-900 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Diagram</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your application's constants, arrays, and configuration objects
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`p-2 rounded-lg transition-colors ${showConnections 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {showConnections ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4" />
            </label>
            
            <button
              onClick={exportData}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={createNewObject}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Object</span>
            </button>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search objects..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Types</option>
              {objectTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[60vh] relative">
        <div 
          ref={canvasRef}
          className={`${viewMode === 'grid' 
            ? 'w-full min-h-[60vh] overflow-auto p-8' 
            : 'p-4'
          }`}
        >
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {filteredObjects.map(obj => renderObjectCard(obj))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
              {filteredObjects.map(obj => renderObjectCard(obj))}
            </div>
          )}
          
          {filteredObjects.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <FileJson className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">No data objects found</p>
              <p className="text-sm">Create your first data object to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Panel */}
      {renderEditPanel()}
    </div>
  );
};

export default DataDiagramView;