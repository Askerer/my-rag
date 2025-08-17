'use client';

import { useState } from 'react';
import { Search, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Array<{
    title: string;
    content: string;
    similarity: number;
  }>;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isLoading: boolean;
  ragConfig?: any;
}

export default function ChatInterface({ onSendMessage, messages, isLoading, ragConfig }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Search className="w-6 h-6 text-purple-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">智能問答</h2>
      </div>
      
      {/* 聊天歷史 */}
      <div className="h-96 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>開始與 AI 助手對話吧！</p>
            <p className="text-sm mt-2">上傳文檔後即可開始智能問答</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.isUser ? (
                      <User className="w-4 h-4 mr-2" />
                    ) : (
                      <Bot className="w-4 h-4 mr-2" />
                    )}
                    <span className="text-xs opacity-70">
                      {message.isUser ? '您' : 'AI 助手'}
                    </span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                  
                  {/* 顯示來源信息 */}
                  {!message.isUser && message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium mb-1">相關來源:</p>
                      {message.sources.map((source, index) => (
                        <div key={index} className="text-xs opacity-70 mb-1">
                          <div className="font-medium">{source.title}</div>
                          <div className="text-xs opacity-60">相似度: {(source.similarity * 100).toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex items-center">
                    <Bot className="w-4 h-4 mr-2" />
                    <span className="text-xs opacity-70">AI 助手</span>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 輸入區域 */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="請輸入您的問題..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
} 