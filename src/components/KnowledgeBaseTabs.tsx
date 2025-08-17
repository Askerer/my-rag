'use client';

import { useState } from 'react';

type TabType = 'knowledge-base' | 'api';

interface KnowledgeBaseTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function KnowledgeBaseTabs({ activeTab, onTabChange }: KnowledgeBaseTabsProps) {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onTabChange('knowledge-base')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'knowledge-base'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        知識庫
      </button>
      <button
        onClick={() => onTabChange('api')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'api'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        API
      </button>
    </div>
  );
}
