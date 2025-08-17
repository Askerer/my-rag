'use client';

import { Code, Key, Globe, Database } from 'lucide-react';

export default function APITab() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Code className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">API 管理</h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          管理您的 API 金鑰、端點和整合設定，以便與外部系統進行連接。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">API 金鑰</h4>
          <p className="text-sm text-gray-600 mb-4">管理您的 API 金鑰和權限設定</p>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            查看金鑰 →
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">端點管理</h4>
          <p className="text-sm text-gray-600 mb-4">配置和管理 API 端點</p>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            管理端點 →
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Database className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">資料整合</h4>
          <p className="text-sm text-gray-600 mb-4">設定外部資料源整合</p>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            設定整合 →
          </button>
        </div>
      </div>
    </div>
  );
}
