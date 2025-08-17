'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Settings, Upload, Send, Bot, User, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '../../../components/AuthGuard';
import FileUpload from '../../../components/FileUpload';
import RAGConfig from '../../../components/RAGConfig';
import StatusIndicator from '../../../components/StatusIndicator';
import { useTranslation } from '../../../lib/i18n/context';
import type { KnowledgeBase } from '../../../components/KnowledgeBaseCard';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'error';
  chunks?: number;
  content?: string;
}

type Status = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

interface RAGConfigData {
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

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Array<{
    filename: string;
    content: string;
    similarity: number;
  }>;
}

function KnowledgeBaseDetailContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const knowledgeBaseId = params.id as string;

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // 聊天相關狀態
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ragConfig, setRagConfig] = useState<RAGConfigData>({
    chunkSize: 1000,
    chunkOverlap: 200,
    embeddingModel: 'text-embedding-ada-002',
    vectorStore: 'faiss',
    similarityThreshold: 0.7,
    searchMode: 'semantic' as 'semantic' | 'keyword' | 'hybrid',
    keywordWeight: 0.3,
    semanticWeight: 0.7,
    enableRerank: false,
    rerankModel: 'cohere-rerank-3',
    topK: 5,
    rerankTopK: 3,
  });

  useEffect(() => {
    // 模擬從 API 獲取知識庫詳情
    const loadKnowledgeBase = () => {
      // 根據 ID 模擬不同的知識庫數據
      const knowledgeBaseMap: Record<string, { name: string; description: string; documentsCount: number; tokensCount: number }> = {
        'kb-1755332751595': {
          name: '技術文檔庫',
          description: '包含各種技術文檔和使用手冊',
          documentsCount: 5,
          tokensCount: 12500,
        },
        'kb-1755332751596': {
          name: '產品說明書',
          description: '產品功能說明和操作指南',
          documentsCount: 8,
          tokensCount: 18000,
        },
        'kb-1755332751597': {
          name: 'FAQ 問答集',
          description: '常見問題與解答',
          documentsCount: 3,
          tokensCount: 8500,
        },
      };

      const kbData = knowledgeBaseMap[knowledgeBaseId] || {
        name: `知識庫 ${knowledgeBaseId}`,
        description: '這是一個示例知識庫',
        documentsCount: 5,
        tokensCount: 12500,
      };

      const mockKb: KnowledgeBase = {
        id: knowledgeBaseId,
        name: kbData.name,
        description: kbData.description,
        documentsCount: kbData.documentsCount,
        tokensCount: kbData.tokensCount,
        appsUsingCount: 2,
        updatedAt: new Date(),
      };
      setKnowledgeBase(mockKb);

      // 模擬一些已上傳的文件
      const mockFiles: UploadedFile[] = [
        {
          id: 'file-1',
          name: 'API文檔.pdf',
          size: 2048576, // 2MB
          type: 'application/pdf',
          uploadDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
          status: 'completed',
          chunks: 45,
          content: 'API文檔的內容預覽...',
        },
        {
          id: 'file-2',
          name: '使用者手冊.docx',
          size: 1536000, // 1.5MB
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
          status: 'completed',
          chunks: 32,
          content: '使用者手冊的內容預覽...',
        },
        {
          id: 'file-3',
          name: 'FAQ.md',
          size: 512000, // 0.5MB
          type: 'text/markdown',
          uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
          status: 'completed',
          chunks: 18,
          content: 'FAQ文檔的內容預覽...',
        },
      ];
      setUploadedFiles(mockFiles);
    };

    if (knowledgeBaseId) {
      loadKnowledgeBase();
    }
  }, [knowledgeBaseId]);

  // 自動滾動到聊天底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化歡迎消息
  useEffect(() => {
    if (knowledgeBase && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: t('chat.welcomeMessage', { knowledgeBaseName: knowledgeBase.name }),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [knowledgeBase, messages.length, t]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!knowledgeBaseId || files.length === 0) return;
    setIsUploading(true);
    setStatus('uploading');

    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('knowledgeBaseId', knowledgeBaseId);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || '上傳失敗');

      const processed = (result.files || []).map((f: any) => ({
        ...f,
        uploadDate: new Date(f.uploadDate),
      }));
      setUploadedFiles((prev) => [...prev, ...processed]);
      setFiles([]);
      setStatus('ready');
      setStatusMessage('文件已成功處理並添加到知識庫');
      
      // 更新知識庫統計
      if (knowledgeBase) {
        setKnowledgeBase({
          ...knowledgeBase,
          documentsCount: knowledgeBase.documentsCount + processed.length,
          updatedAt: new Date(),
        });
      }
    } catch (e) {
      setStatus('error');
      setStatusMessage('上傳或處理失敗');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfigChange = (key: keyof RAGConfigData, value: string | number | boolean) => {
    setRagConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading || !knowledgeBaseId) return;

    // 添加用戶消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      // 調用聊天 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          knowledgeBaseId: knowledgeBaseId,
          ragConfig: ragConfig,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: result.response,
          isUser: false,
          timestamp: new Date(),
          sources: result.sources,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.error || '回應失敗');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: t('chat.errorMessage'),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!knowledgeBase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入知識庫詳情...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/knowledge-base"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('knowledgeBase.backToList')}</span>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{knowledgeBase.name}</h1>
              <p className="text-gray-600 mt-1">
{knowledgeBase.documentsCount} {t('knowledgeBase.fileCount')} · {knowledgeBase.tokensCount} {t('knowledgeBase.tokens')} · 
                {t('knowledgeBase.updated')} {knowledgeBase.updatedAt.toLocaleDateString()}
              </p>
              {knowledgeBase.description && (
                <p className="text-gray-500 mt-2">{knowledgeBase.description}</p>
              )}
            </div>
          </div>


        </div>

        {/* Status Indicator */}
        <div className="mb-6">
          <StatusIndicator status={status} message={statusMessage} />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Top Row - File Upload and RAG Config */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - File Upload with List */}
            <FileUpload
              onFilesChange={handleFilesChange}
              onUpload={handleUpload}
              onFilesProcessed={(processed) => {
                setUploadedFiles((prev) => [...prev, ...processed]);
              }}
              isUploading={isUploading}
              uploadedFiles={uploadedFiles}
              onDeleteFile={(id) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id))}
              onViewFile={() => {}}
            />

            {/* Right Column - RAG Config */}
            <RAGConfig config={ragConfig} onConfigChange={handleConfigChange} />
          </div>

          {/* Bottom Row - Chat Interface */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="flex items-center p-6 border-b border-gray-200">
              <MessageCircle className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t('chat.title')}</h2>
              <div className="ml-auto text-sm text-gray-500">
                {uploadedFiles.length > 0 ? 
                  `${t('knowledgeBase.canQuery')} ${uploadedFiles.length} ${t('knowledgeBase.fileCount')}` : 
                  t('knowledgeBase.uploadFirst')
                }
              </div>
            </div>
            
            <div className="flex flex-col h-96">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-lg ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        {message.isUser ? (
                          <User className="w-4 h-4 mr-2" />
                        ) : (
                          <Bot className="w-4 h-4 mr-2" />
                        )}
                        <span className="text-xs opacity-75">
                          {message.isUser ? t('chat.user') : t('chat.assistant')}
                        </span>
                        <span className="text-xs opacity-50 ml-2">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      
                      {/* 顯示來源文檔 */}
                      {!message.isUser && message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs font-medium mb-2 opacity-75">{t('chat.sources')}</div>
                          {message.sources.map((source, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              <div className="flex items-center text-xs opacity-75">
                                <Upload className="w-3 h-3 mr-1" />
                                <span className="font-medium">{source.filename}</span>
                                <span className="ml-2">{t('chat.similarity')}: {(source.similarity * 100).toFixed(1)}%</span>
                              </div>
                              <div className="text-xs opacity-60 mt-1 pl-4 line-clamp-2">
                                {source.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                      <div className="flex items-center">
                        <Bot className="w-4 h-4 mr-2" />
                        <span className="text-xs opacity-75">{t('chat.assistant')}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm ml-2">{t('chat.thinking')}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      uploadedFiles.length > 0 
                        ? t('chat.inputPlaceholder')
                        : t('chat.inputPlaceholderDisabled')
                    }
                    disabled={isChatLoading || uploadedFiles.length === 0}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isChatLoading || uploadedFiles.length === 0}
                    className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                
                {uploadedFiles.length === 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {t('knowledgeBase.uploadFirst')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBaseDetailPage() {
  return (
    <AuthGuard requiredGroups={['RAG_Users', 'RAG_Admins', 'Administrators']}>
      <KnowledgeBaseDetailContent />
    </AuthGuard>
  );
}
