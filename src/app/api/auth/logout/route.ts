import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '../../../../lib/sessions';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token');

    // 如果有 session token，從存儲中刪除
    if (sessionToken) {
      deleteSession(sessionToken.value);
    }

    const response = NextResponse.json({ success: true });

    // 清除 session cookie
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即過期
    });

    return response;
  } catch (error) {
    console.error('登出失敗:', error);
    return NextResponse.json(
      { error: '登出處理失敗' },
      { status: 500 }
    );
  }
}
