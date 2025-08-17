'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Loader2 } from 'lucide-react';
import AuthGuard from '../../components/AuthGuard';

interface Message {
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

interface KnowledgeBase {
  id: string;
  name: string;
  documentsCount: number;
}

function ChatBotContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKbId, setSelectedKbId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 模擬知識庫數據
  useEffect(() => {
    const mockKbs: KnowledgeBase[] = [
      { id: 'kb-1', name: '技術文檔', documentsCount: 15 },
      { id: 'kb-2', name: '產品手冊', documentsCount: 8 },
      { id: 'kb-3', name: 'FAQ', documentsCount: 12 },
    ];
    setKnowledgeBases(mockKbs);
    if (mockKbs.length > 0) {
      setSelectedKbId(mockKbs[0].id);
    }

    // 歡迎消息
    const welcomeMessage: Message = {
      id: 'welcome',
      text: '您好！我是 AI 助手，可以幫您查詢已上傳的文檔內容。請選擇一個知識庫並開始提問。',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    if (!selectedKbId) {
      alert('請先選擇一個知識庫');
      return;
    }

    // 添加用戶消息
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 調用聊天 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          knowledgeBaseId: selectedKbId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const aiMessage: Message = {
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
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '抱歉，處理您的問題時出現錯誤。請稍後再試。',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedKb = knowledgeBases.find(kb => kb.id === selectedKbId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 聊天助手</h1>
          <p className="text-gray-600">與 AI 對話，即時查詢您的文檔內容</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Knowledge Base Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">選擇知識庫</h3>
              <div className="space-y-2">
                {knowledgeBases.map((kb) => (
                  <button
                    key={kb.id}
                    onClick={() => setSelectedKbId(kb.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedKbId === kb.id
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{kb.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {kb.documentsCount} 個文件
                    </div>
                  </button>
                ))}
              </div>
              
              {selectedKb && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>當前知識庫：</strong> {selectedKb.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    包含 {selectedKb.documentsCount} 個文件
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg h-[700px] flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                          {message.isUser ? '您' : 'AI 助手'}
                        </span>
                        <span className="text-xs opacity-50 ml-2">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      
                      {/* 顯示來源文檔 */}
                      {!message.isUser && message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs font-medium mb-2 opacity-75">參考來源：</div>
                          {message.sources.map((source, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              <div className="flex items-center text-xs opacity-75">
                                <FileText className="w-3 h-3 mr-1" />
                                <span className="font-medium">{source.filename}</span>
                                <span className="ml-2">相似度: {(source.similarity * 100).toFixed(1)}%</span>
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
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                      <div className="flex items-center">
                        <Bot className="w-4 h-4 mr-2" />
                        <span className="text-xs opacity-75">AI 助手</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm">正在思考中...</span>
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
                      selectedKbId 
                        ? "輸入您的問題..." 
                        : "請先選擇知識庫"
                    }
                    disabled={isLoading || !selectedKbId}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading || !selectedKbId}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                
                {selectedKb && (
                  <div className="mt-2 text-xs text-gray-500">
                    正在使用知識庫：{selectedKb.name}
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

export default function ChatPage() {
  return (
    <AuthGuard requiredGroups={['RAG_Users', 'RAG_Admins', 'Administrators']}>
      <ChatBotContent />
    </AuthGuard>
  );
}
