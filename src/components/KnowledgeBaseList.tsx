'use client';

import KnowledgeBaseCard, { KnowledgeBase } from './KnowledgeBaseCard';
import { Plus } from 'lucide-react';
import { useTranslation } from '../lib/i18n/context';

interface KnowledgeBaseListProps {
  items: KnowledgeBase[];
  onSelect: (kbId: string) => void;
  onCreateClick: () => void;
  onDoubleClick?: (kbId: string) => void;
}

export default function KnowledgeBaseList({ items, onSelect, onCreateClick, onDoubleClick }: KnowledgeBaseListProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-semibold text-gray-900">{t('knowledgeBase.list')}</h2>
          <div className="text-sm text-gray-500">{items.length} {t('knowledgeBase.fileCount')}</div>
        </div>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" /> {t('knowledgeBase.create')}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-14 border border-dashed rounded-xl bg-white">
          <p className="text-gray-600 mb-2">{t('knowledgeBase.empty')}</p>
          <button
            onClick={onCreateClick}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" /> {t('knowledgeBase.createFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((kb) => (
            <KnowledgeBaseCard 
              key={kb.id} 
              kb={kb} 
              onSelect={onSelect} 
              onDoubleClick={onDoubleClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}


