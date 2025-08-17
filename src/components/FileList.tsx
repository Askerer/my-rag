'use client';

import { useState } from 'react';
import { FileText, Trash2, Download, Eye, Calendar } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'error';
  chunks?: number;
}

interface FileListProps {
  files: UploadedFile[];
  onDeleteFile: (fileId: string) => void;
  onViewFile: (fileId: string) => void;
}

export default function FileList({ files, onDeleteFile, onViewFile }: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">文件清單</h2>
        </div>
        <div className="text-sm text-gray-500">
          共 {files.length} 個文件
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">暫無上傳的文件</p>
          <p className="text-sm text-gray-400 mt-2">上傳文件後將在此顯示</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                selectedFile === file.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedFile(file.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {file.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                        {getStatusText(file.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {file.uploadDate.toLocaleDateString()}
                      </span>
                      {file.chunks && (
                        <>
                          <span>•</span>
                          <span>{file.chunks} 個文本塊</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewFile(file.id);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="查看詳情"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="刪除文件"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 統計信息 */}
      {files.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">統計信息</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-gray-500">總文件數</div>
              <div className="font-medium">{files.length}</div>
            </div>
            <div>
              <div className="text-gray-500">總大小</div>
              <div className="font-medium">
                {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
              </div>
            </div>
            <div>
              <div className="text-gray-500">已完成</div>
              <div className="font-medium text-green-600">
                {files.filter(f => f.status === 'completed').length}
              </div>
            </div>
            <div>
              <div className="text-gray-500">處理中</div>
              <div className="font-medium text-yellow-600">
                {files.filter(f => f.status === 'processing').length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 