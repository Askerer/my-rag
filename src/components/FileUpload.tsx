'use client';

import { useState } from 'react';
import { Upload, FileText, X, Trash2, Eye, Calendar } from 'lucide-react';
import { useTranslation } from '../lib/i18n/context';

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

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  onUpload: () => void;
  onFilesProcessed: (files: UploadedFile[]) => void;
  isUploading: boolean;
  disabled?: boolean;
  uploadedFiles?: UploadedFile[];
  onDeleteFile?: (fileId: string) => void;
  onViewFile?: (fileId: string) => void;
}

export default function FileUpload({ 
  onFilesChange, 
  onUpload, 
  onFilesProcessed, 
  isUploading, 
  disabled, 
  uploadedFiles = [], 
  onDeleteFile, 
  onViewFile 
}: FileUploadProps) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    const newFiles = [...files, ...uploadedFiles];
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0 || disabled) return;
    
    setUploadStatus('正在上傳文件...');
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus('文件上傳成功！');
        onUpload();
        
        // 通知父組件文件已處理
        if (result.files) {
          const processedFiles: UploadedFile[] = result.files.map((file: any) => ({
            ...file,
            uploadDate: new Date(file.uploadDate),
          }));
          onFilesProcessed(processedFiles);
        }
        
        // 清空文件列表
        setFiles([]);
        onFilesChange([]);
      } else {
        setUploadStatus(`上傳失敗: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus('上傳過程中發生錯誤');
      console.error('上傳錯誤:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Upload className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">{t('file.upload')}</h2>
      </div>

      {/* 拖拽上傳區域 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
{t('file.dragDrop')}
          </p>
          <p className="text-sm text-gray-500">
{t('file.uploadDescription')}
          </p>
        </label>
      </div>

      {/* 已上傳文件列表 */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">已選擇的文件</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 禁用提示 */}
      {disabled && (
        <div className="mt-4 p-3 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
          請先選擇一個知識庫再上傳文件。
        </div>
      )}

      {/* 上傳狀態 */}
      {uploadStatus && (
        <div className="mt-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
          {uploadStatus}
        </div>
      )}

      {/* 上傳按鈕 */}
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || isUploading || !!disabled}
        className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
{isUploading ? t('file.uploading') : t('file.processing')}
      </button>

      {/* 已上傳文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">已上傳文件</h3>
            <div className="text-sm text-gray-500">
              共 {uploadedFiles.length} 個文件
            </div>
          </div>
          
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {file.name}
                        </h4>
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
                    {onViewFile && (
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
                    )}
                    {onDeleteFile && (
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
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 統計信息 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">統計信息</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-gray-500">總文件數</div>
                <div className="font-medium">{uploadedFiles.length}</div>
              </div>
              <div>
                <div className="text-gray-500">總大小</div>
                <div className="font-medium">
                  {formatFileSize(uploadedFiles.reduce((sum, file) => sum + file.size, 0))}
                </div>
              </div>
              <div>
                <div className="text-gray-500">已完成</div>
                <div className="font-medium text-green-600">
                  {uploadedFiles.filter(f => f.status === 'completed').length}
                </div>
              </div>
              <div>
                <div className="text-gray-500">處理中</div>
                <div className="font-medium text-yellow-600">
                  {uploadedFiles.filter(f => f.status === 'processing').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 