'use client';

import { useEffect, useState } from 'react';
import { checkAuthStatus, type User } from '../lib/auth';
import LoginModal from './LoginModal';
import { login, logout } from '../lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredGroups?: string[];
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, requiredGroups = [], fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, [hasCheckedAuth]);

  const checkAuth = async () => {
    setIsLoading(true);
    setHasCheckedAuth(true);
    try {
      const currentUser = await checkAuthStatus();
      setUser(currentUser);
      
      if (!currentUser && !isLoginOpen) {
        setIsLoginOpen(true);
      }
    } catch (error) {
      console.error('檢查認證狀態失敗:', error);
      if (!isLoginOpen) {
        setIsLoginOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      const loggedInUser = await login(username, password);
      setUser(loggedInUser);
      setIsLoginOpen(false);
      setLoginError(null);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : '登入失敗');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsLoginOpen(true);
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  // 檢查權限
  const hasPermission = () => {
    if (!user || !user.isAuthenticated) {
      return false;
    }

    if (requiredGroups.length === 0) {
      return true;
    }

    return requiredGroups.some(group => user.groups.includes(group));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">檢查認證狀態...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAuthenticated) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">需要登入</h1>
              <p className="text-gray-600 mb-4">請登入以繼續使用系統</p>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                登入
              </button>
            </div>
          </div>
        )}
        
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
          isLoading={isLoggingIn}
          error={loginError}
        />
      </>
    );
  }

  if (!hasPermission()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">權限不足</h1>
          <p className="text-gray-600 mb-4">
            您沒有權限訪問此頁面。需要以下群組之一：{requiredGroups.join(', ')}
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            登出
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        isLoading={isLoggingIn}
        error={loginError}
      />
    </>
  );
}
