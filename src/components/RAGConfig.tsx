'use client';

import { Settings } from 'lucide-react';
import { useTranslation } from '../lib/i18n/context';

interface RAGConfig {
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  vectorStore: string;
  similarityThreshold: number;
  searchMode: 'semantic' | 'keyword' | 'hybrid';
  keywordWeight: number;
  semanticWeight: number;
  enableRerank: boolean;
  rerankModel: string;
  topK: number;
  rerankTopK: number;
}

interface RAGConfigProps {
  config: RAGConfig;
  onConfigChange: (key: keyof RAGConfig, value: string | number | boolean) => void;
}

export default function RAGConfig({ config, onConfigChange }: RAGConfigProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 text-green-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">{t('rag.title')}</h2>
      </div>

      <div className="space-y-6">
        {/* Chunk 大小 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rag.chunkSize')}
          </label>
          <input
            type="number"
            value={config.chunkSize}
            onChange={(e) => onConfigChange('chunkSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="100"
            max="5000"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('rag.chunkSizeDescription')}
          </p>
        </div>

        {/* Chunk 重疊 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rag.chunkOverlap')}
          </label>
          <input
            type="number"
            value={config.chunkOverlap}
            onChange={(e) => onConfigChange('chunkOverlap', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="1000"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('rag.chunkOverlapDescription')}
          </p>
        </div>

        {/* 嵌入模型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rag.embeddingModel')}
          </label>
          <select
            value={config.embeddingModel}
            onChange={(e) => onConfigChange('embeddingModel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="text-embedding-ada-002">OpenAI Ada-002</option>
            <option value="text-embedding-3-small">OpenAI 3-Small</option>
            <option value="text-embedding-3-large">OpenAI 3-Large</option>
            <option value="sentence-transformers">Sentence Transformers</option>
          </select>
        </div>

        {/* 向量數據庫 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rag.vectorStore')}
          </label>
          <select
            value={config.vectorStore}
            onChange={(e) => onConfigChange('vectorStore', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="faiss">FAISS</option>
            <option value="pinecone">Pinecone</option>
            <option value="weaviate">Weaviate</option>
            <option value="chroma">Chroma</option>
          </select>
        </div>

        {/* 相似度閾值 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rag.similarityThreshold')}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.similarityThreshold}
            onChange={(e) => onConfigChange('similarityThreshold', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.0</span>
            <span>{config.similarityThreshold}</span>
            <span>1.0</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t('rag.similarityThresholdDescription')}
          </p>
        </div>

        {/* 搜尋模式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rag.searchMode')}
          </label>
          <select
            value={config.searchMode}
            onChange={(e) => onConfigChange('searchMode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="semantic">{t('rag.semanticSearch')}</option>
            <option value="keyword">{t('rag.keywordSearch')}</option>
            <option value="hybrid">{t('rag.hybridSearch')}</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {t('rag.searchModeDescription')}
          </p>
        </div>

        {/* Hybrid Search 權重設定 */}
        {config.searchMode === 'hybrid' && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h4 className="text-sm font-medium text-gray-700">{t('rag.hybridWeights')}</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rag.semanticWeight')}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.semanticWeight}
                onChange={(e) => onConfigChange('semanticWeight', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.0</span>
                <span>{config.semanticWeight}</span>
                <span>1.0</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('rag.keywordWeight')}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.keywordWeight}
                onChange={(e) => onConfigChange('keywordWeight', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.0</span>
                <span>{config.keywordWeight}</span>
                <span>1.0</span>
              </div>
            </div>
          </div>
        )}

        {/* 檢索數量 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('rag.topK')}
          </label>
          <input
            type="number"
            value={config.topK}
            onChange={(e) => onConfigChange('topK', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="50"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('rag.topKDescription')}
          </p>
        </div>

        {/* Rerank 設定 */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">
              {t('rag.enableRerank')}
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableRerank}
                onChange={(e) => onConfigChange('enableRerank', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            {t('rag.rerankDescription')}
          </p>

          {config.enableRerank && (
            <div className="bg-green-50 p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('rag.rerankModel')}
                </label>
                <select
                  value={config.rerankModel}
                  onChange={(e) => onConfigChange('rerankModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cohere-rerank-3">Cohere Rerank-3</option>
                  <option value="cohere-rerank-multilingual">Cohere Rerank Multilingual</option>
                  <option value="bge-reranker-large">BGE Reranker Large</option>
                  <option value="bge-reranker-base">BGE Reranker Base</option>
                  <option value="cross-encoder-ms-marco">Cross-Encoder MS MARCO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('rag.rerankTopK')}
                </label>
                <input
                  type="number"
                  value={config.rerankTopK}
                  onChange={(e) => onConfigChange('rerankTopK', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max={config.topK}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('rag.rerankTopKDescription')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 配置預覽 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('rag.currentConfig')}</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <div>{t('rag.chunkSize')}: {config.chunkSize} {t('rag.characters')}</div>
            <div>{t('rag.chunkOverlap')}: {config.chunkOverlap} {t('rag.characters')}</div>
            <div>{t('rag.embeddingModel')}: {config.embeddingModel}</div>
            <div>{t('rag.vectorStore')}: {config.vectorStore}</div>
            <div>{t('rag.similarityThreshold')}: {config.similarityThreshold}</div>
            <div>{t('rag.searchMode')}: {t(`rag.${config.searchMode}Search`)}</div>
            <div>{t('rag.topK')}: {config.topK}</div>
            <div>{t('rag.enableRerank')}: {config.enableRerank ? t('common.yes') : t('common.no')}</div>
            {config.searchMode === 'hybrid' && (
              <>
                <div>{t('rag.semanticWeight')}: {config.semanticWeight}</div>
                <div>{t('rag.keywordWeight')}: {config.keywordWeight}</div>
              </>
            )}
            {config.enableRerank && (
              <>
                <div>{t('rag.rerankModel')}: {config.rerankModel}</div>
                <div>{t('rag.rerankTopK')}: {config.rerankTopK}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 