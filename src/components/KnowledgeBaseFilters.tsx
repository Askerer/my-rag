'use client';

import { Search, Filter, Tag } from 'lucide-react';

interface KnowledgeBaseFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterChange: (type: string) => void;
}

export default function KnowledgeBaseFilters({ 
  searchQuery, 
  onSearchChange, 
  filterType, 
  onFilterChange 
}: KnowledgeBaseFiltersProps) {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-3 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋知識庫..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部</option>
            <option value="recent">最近更新</option>
            <option value="name">按名稱</option>
            <option value="documents">按文件數</option>
          </select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <input
            type="checkbox"
            id="all-knowledge"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="all-knowledge" className="flex items-center">
            所有知識
            <span className="ml-1 w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs">?</span>
          </label>
        </div>
        <button className="flex items-center space-x-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
          <Tag className="w-4 h-4" />
          <span>全部</span>
        </button>
      </div>
    </div>
  );
}
