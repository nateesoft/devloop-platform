'use client';

import React from 'react';

import TemplateSelector from './TemplateSelector';

interface PallateToolsProps {
  collapsedGroups: Record<string, boolean>;
  toggleGroup: (groupName: string) => void;
  selectedTemplate: string;
  handleTemplateChange: (templateId: string) => void;
  onDragStart: (event: React.DragEvent, nodeType: string, nodeData: any) => void;
  isFullscreen: boolean;
}

const PallateTools: React.FC<PallateToolsProps> = ({
  collapsedGroups,
  toggleGroup,
  selectedTemplate,
  handleTemplateChange,
  onDragStart,
  isFullscreen
}) => {
  return (
    <div className={isFullscreen 
      ? "absolute top-4 left-4 bottom-4 w-56 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-y-auto" 
      : "absolute top-4 left-4 bottom-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-y-auto"
    }>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Service Tools</h4>
        {isFullscreen && (
          <span className="text-xs text-slate-500 dark:text-slate-400">ESC to exit</span>
        )}
      </div>

      {/* Template Selection Dropdown */}
      <TemplateSelector 
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
      />

      <div className="space-y-3">
        
        {/* Input Group */}
        <div>
          <button 
            onClick={() => toggleGroup('Input')}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              Input
            </span>
            <svg 
              className={`w-4 h-4 transition-transform ${collapsedGroups['Input'] ? 'rotate-0' : 'rotate-90'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {!collapsedGroups['Input'] && (
            <div className="mt-2 ml-5 space-y-2">
              {/* HTTP In Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'http-in', {
                  label: 'HTTP In',
                  nodeType: 'httpIn',
                  style: {
                    background: '#3B82F6',
                    color: 'white',
                    border: '2px solid #1D4ED8',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs text-slate-600 dark:text-slate-400">HTTP In</span>
              </div>

              {/* Auth Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'auth', {
                  label: 'Auth',
                  nodeType: 'authentication',
                  style: {
                    background: '#3B82F6',
                    color: 'white',
                    border: '2px solid #1D4ED8',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Auth</span>
              </div>

              {/* Param Extract Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'param-extract', {
                  label: 'Param Extract',
                  nodeType: 'paramExtract',
                  style: {
                    background: '#3B82F6',
                    color: 'white',
                    border: '2px solid #1D4ED8',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Param Extract</span>
              </div>

              {/* Validator Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'validator', {
                  label: 'Validator',
                  nodeType: 'validator',
                  style: {
                    background: '#3B82F6',
                    color: 'white',
                    border: '2px solid #1D4ED8',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Validator</span>
              </div>

            </div>
          )}
        </div>

        {/* Process Group */}
        <div>
          <button 
            onClick={() => toggleGroup('Process')}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              Process
            </span>
            <svg 
              className={`w-4 h-4 transition-transform ${collapsedGroups['Process'] ? 'rotate-0' : 'rotate-90'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {!collapsedGroups['Process'] && (
            <div className="mt-2 ml-5 space-y-2">
              {/* Mapper Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'mapper', {
                  label: 'Mapper',
                  nodeType: 'mapper',
                  style: {
                    background: '#10B981',
                    color: 'white',
                    border: '2px solid #047857',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Mapper</span>
              </div>

              {/* DB Action Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'db-action', {
                  label: 'DB Action',
                  nodeType: 'databaseAction',
                  style: {
                    background: '#10B981',
                    color: 'white',
                    border: '2px solid #047857',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">DB Action</span>
              </div>

              {/* JSON Logic Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'json-logic', {
                  label: 'JSON Logic',
                  nodeType: 'jsonLogic',
                  style: {
                    background: '#10B981',
                    color: 'white',
                    border: '2px solid #047857',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">JSON Logic</span>
              </div>

              {/* Branch Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'branch', {
                  label: 'Branch',
                  nodeType: 'branch',
                  style: {
                    background: '#10B981',
                    color: 'white',
                    border: '2px solid #047857',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Branch</span>
              </div>

              {/* Paginator Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'paginator', {
                  label: 'Paginator',
                  nodeType: 'paginator',
                  style: {
                    background: '#10B981',
                    color: 'white',
                    border: '2px solid #047857',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Paginator</span>
              </div>

              {/* Error Handler Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'error-handler', {
                  label: 'Error Handler',
                  nodeType: 'errorHandler',
                  style: {
                    background: '#10B981',
                    color: 'white',
                    border: '2px solid #047857',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Error Handler</span>
              </div>
            </div>
          )}
        </div>

        {/* Output Group */}
        <div>
          <button 
            onClick={() => toggleGroup('Output')}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              Output
            </span>
            <svg 
              className={`w-4 h-4 transition-transform ${collapsedGroups['Output'] ? 'rotate-0' : 'rotate-90'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {!collapsedGroups['Output'] && (
            <div className="mt-2 ml-5 space-y-2">
              {/* HTTP Out Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'http-out', {
                  label: 'HTTP Out',
                  nodeType: 'httpResponse',
                  style: {
                    background: '#8B5CF6',
                    color: 'white',
                    border: '2px solid #6D28D9',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">HTTP Out</span>
              </div>
            </div>
          )}
        </div>

        {/* Special Group */}
        <div>
          <button 
            onClick={() => toggleGroup('Special')}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
              Special
            </span>
            <svg 
              className={`w-4 h-4 transition-transform ${collapsedGroups['Special'] ? 'rotate-0' : 'rotate-90'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {!collapsedGroups['Special'] && (
            <div className="mt-2 ml-5 space-y-2">
              {/* Trigger Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'trigger', {
                  label: 'Trigger',
                  nodeType: 'trigger',
                  style: {
                    background: '#FFFF33',
                    color: 'black',
                    border: '2px solid #F0F000',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Trigger</span>
              </div>

              {/* External Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'external', {
                  label: 'External',
                  nodeType: 'externalService',
                  style: {
                    background: '#FFFF33',
                    color: 'black',
                    border: '2px solid #F0F000',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 140,
                    textAlign: 'center',
                  }
                })}
              >
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2c2.5 2.5 2.5 9.5 0 10"/>
                  <path d="M12 22c-2.5-2.5-2.5-9.5 0-10"/>
                  <path d="M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs text-slate-600 dark:text-slate-400">External</span>
              </div>
            </div>
          )}
        </div>

        {/* Group Service Group */}
        <div>
          <button 
            onClick={() => toggleGroup('Group Service')}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
              Group Service
            </span>
            <svg 
              className={`w-4 h-4 transition-transform ${collapsedGroups['Group Service'] ? 'rotate-0' : 'rotate-90'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {!collapsedGroups['Group Service'] && (
            <div className="mt-2 ml-5 space-y-2">
              {/* Group Node */}
              <div 
                className="flex items-center space-x-2 p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg cursor-grab hover:scale-105 transition-transform active:cursor-grabbing"
                draggable
                onDragStart={(event) => onDragStart(event, 'group', {
                  label: 'Group',
                  nodeType: 'group',
                  style: {
                    background: 'rgba(251, 146, 60, 0.1)',
                    color: '#F97316',
                    border: '2px dashed #F97316',
                    borderRadius: '15px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    width: 200,
                    height: 150,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                })}
              >
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Group</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PallateTools;