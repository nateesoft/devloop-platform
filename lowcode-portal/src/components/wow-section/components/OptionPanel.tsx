'use client';

import React from 'react';

interface OptionPanelProps {
  showOptionPanel: boolean;
  toggleOptionPanel: () => void;
  serviceType: string;
  setServiceType: (value: string) => void;
  programmingLanguage: string;
  setProgrammingLanguage: (value: string) => void;
  enableLogs: boolean;
  setEnableLogs: (value: boolean) => void;
  enableAuditLogs: boolean;
  setEnableAuditLogs: (value: boolean) => void;
  rateLimit: string;
  setRateLimit: (value: string) => void;
  authType: string;
  setAuthType: (value: string) => void;
  databaseType: string;
  setDatabaseType: (value: string) => void;
  enableCache: boolean;
  setEnableCache: (value: boolean) => void;
}

const OptionPanel: React.FC<OptionPanelProps> = ({
  showOptionPanel,
  toggleOptionPanel,
  serviceType,
  setServiceType,
  programmingLanguage,
  setProgrammingLanguage,
  enableLogs,
  setEnableLogs,
  enableAuditLogs,
  setEnableAuditLogs,
  rateLimit,
  setRateLimit,
  authType,
  setAuthType,
  databaseType,
  setDatabaseType,
  enableCache,
  setEnableCache,
}) => {
  if (!showOptionPanel) return null;

  return (
    <div className="absolute top-16 left-4 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 z-20 w-96 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Service Configuration</h3>
        <button 
          onClick={toggleOptionPanel}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Service Builder Options */}
      <div className="space-y-4">
        
        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Service Type
          </label>
          <select 
            value={serviceType} 
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="RestApis">REST APIs</option>
            <option value="Graphql">GraphQL</option>
            <option value="SocketIO">Socket.IO</option>
            <option value="Webhook">Webhook</option>
          </select>
        </div>

        {/* Programming Language for Export */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Export Language
          </label>
          <select 
            value={programmingLanguage} 
            onChange={(e) => setProgrammingLanguage(e.target.value)}
            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="NodeJS">Node.js</option>
            <option value="NestJS">NestJS</option>
            <option value="Java Springboot">Java Spring Boot</option>
            <option value="Golang">Go</option>
            <option value="Python">Python</option>
            <option value="PHP">PHP</option>
          </select>
        </div>

        {/* Logs & Audit */}
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={enableLogs}
                onChange={(e) => setEnableLogs(e.target.checked)}
                className="mr-2 w-4 h-4"
              />
              Enable System Logs
            </label>
          </div>
          <div className="flex-1">
            <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={enableAuditLogs}
                onChange={(e) => setEnableAuditLogs(e.target.checked)}
                className="mr-2 w-4 h-4"
              />
              Audit Logs
            </label>
          </div>
        </div>

        {/* Rate Limit */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Rate Limit (req/min)
          </label>
          <input
            type="number"
            value={rateLimit}
            onChange={(e) => setRateLimit(e.target.value)}
            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            placeholder="100"
            min="1"
            max="10000"
          />
        </div>

        {/* Authentication */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Authentication
          </label>
          <select 
            value={authType} 
            onChange={(e) => setAuthType(e.target.value)}
            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="Basic Auth">Basic Auth</option>
            <option value="OAuth2">OAuth 2.0</option>
            <option value="JWT Token">JWT Token</option>
            <option value="API Key">API Key</option>
            <option value="None">No Authentication</option>
          </select>
        </div>

        {/* Database */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Database
          </label>
          <select 
            value={databaseType} 
            onChange={(e) => setDatabaseType(e.target.value)}
            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="MySQL">MySQL</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="SQLite">SQLite</option>
            <option value="MongoDB">MongoDB</option>
            <option value="Redis">Redis</option>
          </select>
        </div>

        {/* Cache */}
        <div>
          <label className="flex items-center text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={enableCache}
              onChange={(e) => setEnableCache(e.target.checked)}
              className="mr-2 w-4 h-4"
            />
            Enable Cache System
          </label>
        </div>

      </div>
    </div>
  );
};

export default OptionPanel;