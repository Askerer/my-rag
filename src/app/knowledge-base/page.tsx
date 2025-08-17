'use client';

import { useMemo, useState } from 'react';
import KnowledgeBaseTabs from '../../components/KnowledgeBaseTabs';
import KnowledgeBaseFilters from '../../components/KnowledgeBaseFilters';
import KnowledgeBaseList from '../../components/KnowledgeBaseList';
import CreateKnowledgeBaseModal from '../../components/CreateKnowledgeBaseModal';
import APITab from '../../components/APITab';
import AuthGuard from '../../components/AuthGuard';
import { useTranslation } from '../../lib/i18n/context';

import type { KnowledgeBase } from '../../components/KnowledgeBaseCard';

type TabType = 'knowledge-base' | 'api';

export default function KnowledgeBasePage() {
  return (
    <AuthGuard requiredGroups={['RAG_Users', 'RAG_Admins', 'Administrators']}>
      <KnowledgeBaseContent />
    </AuthGuard>
  );
}

function KnowledgeBaseContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('knowledge-base');
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: 'kb-1755332751595',
      name: '技術文檔庫',
      description: '包含各種技術文檔和使用手冊',
      documentsCount: 5,
      tokensCount: 12500,
      appsUsingCount: 2,
      updatedAt: new Date('2025-08-16'),
    },
    {
      id: 'kb-1755332751596',
      name: '產品說明書',
      description: '產品功能說明和操作指南',
      documentsCount: 8,
      tokensCount: 18000,
      appsUsingCount: 1,
      updatedAt: new Date('2025-08-15'),
    },
    {
      id: 'kb-1755332751597',
      name: 'FAQ 問答集',
      description: '常見問題與解答',
      documentsCount: 3,
      tokensCount: 8500,
      appsUsingCount: 3,
      updatedAt: new Date('2025-08-14'),
    },
  ]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');



  // 過濾和搜尋知識庫
  const filteredKnowledgeBases = useMemo(() => {
    let filtered = knowledgeBases;

    // 搜尋過濾
    if (searchQuery) {
      filtered = filtered.filter(kb => 
        kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kb.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 排序過濾
    switch (filterType) {
      case 'recent':
        filtered = [...filtered].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'documents':
        filtered = [...filtered].sort((a, b) => b.documentsCount - a.documentsCount);
        break;
      default:
        break;
    }

    return filtered;
  }, [knowledgeBases, searchQuery, filterType]);

  const handleCreateKb = (data: { name: string; description?: string }) => {
    const kb: KnowledgeBase = {
      id: `kb-${Date.now()}`,
      name: data.name,
      description: data.description,
      documentsCount: 0,
      appsUsingCount: 0,
      tokensCount: 0,
      updatedAt: new Date(),
    };
    setKnowledgeBases((prev) => [kb, ...prev]);
    setIsCreateOpen(false);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('knowledgeBase.title')}</h1>
              <p className="text-gray-600 mt-1">{t('knowledgeBase.subtitle')}</p>
            </div>
          </div>
          
          {/* Tabs */}
          <KnowledgeBaseTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>



        {activeTab === 'knowledge-base' ? (
          <div className="space-y-6">
            {/* Filters */}
            <KnowledgeBaseFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterType={filterType}
              onFilterChange={setFilterType}
            />

            <KnowledgeBaseList
              items={filteredKnowledgeBases}
              onSelect={() => {}} // 單擊不做任何事
              onDoubleClick={(id) => window.location.href = `/knowledge-base/${id}`}
              onCreateClick={() => setIsCreateOpen(true)}
            />
          </div>
        ) : (
          <APITab />
        )}

        <CreateKnowledgeBaseModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateKb}
        />
      </div>
    </div>
  );
}


