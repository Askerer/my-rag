'use client';

import { Folder, Clock } from 'lucide-react';

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  documentsCount: number;
  tokensCount?: number;
  appsUsingCount?: number;
  updatedAt: Date;
}

interface KnowledgeBaseCardProps {
  kb: KnowledgeBase;
  onSelect?: (kbId: string) => void;
  onDoubleClick?: (kbId: string) => void;
}

export default function KnowledgeBaseCard({ kb, onSelect, onDoubleClick }: KnowledgeBaseCardProps) {
  return (
    <button
      onClick={() => onSelect?.(kb.id)}
      onDoubleClick={() => onDoubleClick?.(kb.id)}
      className="w-full text-left bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-4"
    >
      <div className="flex items-start space-x-3">
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Folder className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 truncate">{kb.name}</h3>
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {kb.updatedAt.toLocaleDateString()}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center space-x-2">
            <span>{kb.documentsCount} 文件</span>
            {typeof kb.tokensCount === 'number' && <span>• {kb.tokensCount} 千字</span>}
            {typeof kb.appsUsingCount === 'number' && <span>• {kb.appsUsingCount} 個應用使用</span>}
          </div>
          {kb.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{kb.description}</p>
          )}
        </div>
      </div>
    </button>
  );
}


