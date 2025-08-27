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
  position: { x: number; y: number };
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
  const [dataObjects, setDataObjects] = useState<DataObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<DataObject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showConnections, setShowConnections] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

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
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
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
              ...obj.metadata,
              updatedAt: new Date(),
              version: (obj.metadata?.version || 1) + 1
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
    const originalObject = dataObjects.find(obj => obj.id === id);
    if (originalObject) {
      const duplicatedObject: DataObject = {
        ...originalObject,
        id: `obj_${Date.now()}`,
        name: `${originalObject.name} (Copy)`,
        position: { 
          x: originalObject.position.x + 20, 
          y: originalObject.position.y + 20 
        },
        connections: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
          tags: [...(originalObject.metadata?.tags || [])]
        }
      };
      setDataObjects(prev => [...prev, duplicatedObject]);
    }
  }, [dataObjects]);

  const exportData = useCallback(() => {
    const dataToExport = {
      objects: dataObjects,
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
  }, [dataObjects]);

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
        style={viewMode === 'grid' ? { 
          position: 'absolute', 
          left: obj.position.x, 
          top: obj.position.y,
          minWidth: '200px'
        } : {}}
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
    if (!selectedObject || !isEditing) return null;

    return (
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-lg z-50 overflow-y-auto">
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
              value={selectedObject.name}
              onChange={(e) => updateObject(selectedObject.id, { name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type
            </label>
            <select
              value={selectedObject.type}
              onChange={(e) => updateObject(selectedObject.id, { type: e.target.value as DataObject['type'] })}
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
              value={selectedObject.description || ''}
              onChange={(e) => updateObject(selectedObject.id, { description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Value
            </label>
            <textarea
              value={typeof selectedObject.value === 'object' 
                ? JSON.stringify(selectedObject.value, null, 2)
                : String(selectedObject.value)
              }
              onChange={(e) => {
                try {
                  const parsedValue = JSON.parse(e.target.value);
                  updateObject(selectedObject.id, { value: parsedValue });
                } catch {
                  updateObject(selectedObject.id, { value: e.target.value });
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
              value={selectedObject.category || ''}
              onChange={(e) => updateObject(selectedObject.id, { category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="e.g., Configuration, Constants, API"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full bg-slate-50 dark:bg-slate-900 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Diagram</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your application's constants, arrays, and configuration objects
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
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
        <div className="flex items-center space-x-4 mt-4">
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
          
          <div className="flex items-center space-x-2">
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
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={canvasRef}
          className={`${viewMode === 'grid' 
            ? 'relative w-full h-full overflow-auto p-8' 
            : 'p-4'
          }`}
          style={viewMode === 'grid' ? { minHeight: '2000px', minWidth: '2000px' } : {}}
        >
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {filteredObjects.map(obj => renderObjectCard(obj))}
            </div>
          ) : (
            filteredObjects.map(obj => renderObjectCard(obj))
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