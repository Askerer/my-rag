'use client';

import { useEffect, useState } from 'react';
import { checkAuthStatus, type User } from '../lib/auth';
import LandingPage from '../components/LandingPage';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await checkAuthStatus();
        setUser(userData);
      } catch (error) {
        // 用戶未登入，顯示 Landing Page
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  // 如果用戶已登入，重定向到知識庫管理
  if (user) {
    window.location.href = '/knowledge-base';
    return null;
  }

  // 如果用戶未登入，顯示 Landing Page
  return <LandingPage />;
}