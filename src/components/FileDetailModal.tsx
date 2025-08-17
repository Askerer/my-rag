'use client';

import { X, FileText, Calendar, HardDrive, Hash } from 'lucide-react';

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

interface FileDetailModalProps {
  file: UploadedFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileDetailModal({ file, isOpen, onClose }: FileDetailModalProps) {
  if (!isOpen || !file) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'processing':
        return '處理中';
      case 'error':
        return '錯誤';
      default:
        return '未知';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">文件詳情</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">文件名</label>
                    <p className="text-gray-900">{file.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">文件類型</label>
                    <p className="text-gray-900">{file.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">文件大小</label>
                    <p className="text-gray-900">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">上傳時間</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {file.uploadDate.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">處理狀態</label>
                    <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                      {getStatusText(file.status)}
                    </p>
                  </div>
                  {file.chunks && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">文本塊數量</label>
                      <p className="text-gray-900 flex items-center">
                        <Hash className="w-4 h-4 mr-2" />
                        {file.chunks} 個
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 處理信息 */}
            {file.status === 'completed' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">處理信息</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-green-800 font-medium">文件已成功處理</span>
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    文件已成功分塊並添加到向量數據庫，可以用於智能問答。
                  </p>
                </div>
              </div>
            )}

            {file.status === 'processing' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">處理信息</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-yellow-800 font-medium">正在處理文件</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-2">
                    文件正在進行文本提取、分塊和向量化處理，請稍候...
                  </p>
                </div>
              </div>
            )}

            {file.status === 'error' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">處理信息</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-red-800 font-medium">處理失敗</span>
                  </div>
                  <p className="text-red-700 text-sm mt-2">
                    文件處理過程中出現錯誤，請檢查文件格式或重新上傳。
                  </p>
                </div>
              </div>
            )}

            {/* 文件內容預覽 */}
            {file.content && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">內容預覽</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {file.content.substring(0, 500)}
                      {file.content.length > 500 && '...'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
} 