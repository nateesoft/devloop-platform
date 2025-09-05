'use client';

import React from 'react';
import { WORKFLOW_TEMPLATES } from '../constants/templates';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-600">
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
        Template
      </label>
      <select
        value={selectedTemplate}
        onChange={(e) => {
          const templateId = e.target.value;
          onTemplateChange(templateId);
        }}
        className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">เลือก Template</option>
        {WORKFLOW_TEMPLATES.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TemplateSelector;