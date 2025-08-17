'use client';

import { Plus, ExternalLink } from 'lucide-react';

interface CreateKnowledgeBaseCardProps {
  onCreateClick: () => void;
}

export default function CreateKnowledgeBaseCard({ onCreateClick }: CreateKnowledgeBaseCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors">
      <div className="mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">建立知識庫</h3>
        <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
          匯入您自己的文字資料或透過 Webhook 實時寫入資料以增強 LLM 的上下文。
        </p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onCreateClick}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          建立知識庫
        </button>
        
        <div className="text-center">
          <a
            href="#"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            連接到外部知識庫
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
