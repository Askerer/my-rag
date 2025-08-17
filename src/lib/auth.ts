export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  groups: string[];
  isAuthenticated: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const checkAuthStatus = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/status', {
      credentials: 'include',
    });
    
    if (response.ok) {
      const user = await response.json();
      return user;
    }
    return null;
  } catch (error) {
    console.error('檢查認證狀態失敗:', error);
    return null;
  }
};

export const login = async (username: string, password: string): Promise<User> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '登入失敗');
  }

  return response.json();
};

export const logout = async (): Promise<void> => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
};

export const hasPermission = (user: User | null, requiredGroups: string[]): boolean => {
  if (!user || !user.isAuthenticated) {
    return false;
  }

  if (requiredGroups.length === 0) {
    return true;
  }

  return requiredGroups.some(group => user.groups.includes(group));
};
