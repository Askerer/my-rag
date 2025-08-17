'use client';

import { CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'error';
  message?: string;
}

export default function StatusIndicator({ status, message }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: <Database className="w-5 h-5 text-gray-400" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          text: '等待上傳文件'
        };
      case 'uploading':
        return {
          icon: <Clock className="w-5 h-5 text-blue-500 animate-spin" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          text: '正在上傳文件...'
        };
      case 'processing':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500 animate-spin" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          text: '正在處理文件...'
        };
      case 'ready':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          text: '文件處理完成，可以開始問答'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          text: message || '處理過程中出現錯誤'
        };
      default:
        return {
          icon: <Database className="w-5 h-5 text-gray-400" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          text: '等待上傳文件'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center p-3 rounded-lg ${config.bgColor}`}>
      {config.icon}
      <span className={`ml-2 text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
} 