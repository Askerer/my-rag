// 簡單的記憶體 session 存儲（實際環境中應該使用 Redis 或資料庫）
export const sessions = new Map<string, any>();

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  groups: string[];
  isAuthenticated: boolean;
}

export function getSession(sessionToken: string): SessionUser | null {
  return sessions.get(sessionToken) || null;
}

export function setSession(sessionToken: string, user: SessionUser): void {
  sessions.set(sessionToken, user);
}

export function deleteSession(sessionToken: string): void {
  sessions.delete(sessionToken);
}
