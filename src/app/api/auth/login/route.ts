import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setSession, type SessionUser } from '../../../../lib/sessions';

// 模擬 AD 使用者資料庫
const mockUsers = [
  {
    username: 'admin',
    password: 'admin123', // 實際環境中應該使用加密密碼
    displayName: '系統管理員',
    email: 'admin@company.com',
    groups: ['Administrators', 'RAG_Admins'],
  },
  {
    username: 'john.doe',
    password: 'password123',
    displayName: 'John Doe',
    email: 'john.doe@company.com',
    groups: ['Users', 'RAG_Users'],
  },
  {
    username: 'jane.smith',
    password: 'password123',
    displayName: 'Jane Smith',
    email: 'jane.smith@company.com',
    groups: ['Users', 'RAG_Editors'],
  },
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '使用者名稱和密碼為必填項' },
        { status: 400 }
      );
    }

    // 模擬 AD 認證過程
    const user = mockUsers.find(u => u.username === username);

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: '使用者名稱或密碼錯誤' },
        { status: 401 }
      );
    }

    // 生成 session token (實際環境中應該使用 JWT 或其他安全機制)
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 儲存 session 資訊
    const userSession: SessionUser = {
      id: `user-${Date.now()}`,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      groups: user.groups,
      isAuthenticated: true,
    };
    setSession(sessionToken, userSession);

    // 設定 cookie
    const response = NextResponse.json(userSession);

    // 設定 session cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
    });

    return response;
  } catch (error) {
    console.error('登入失敗:', error);
    return NextResponse.json(
      { error: '登入處理失敗' },
      { status: 500 }
    );
  }
}
