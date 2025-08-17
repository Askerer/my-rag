import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '../../../../lib/sessions';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token');

    if (!sessionToken) {
      return NextResponse.json(null, { status: 401 });
    }

    // 從 session 存儲中獲取使用者資訊
    const user = getSession(sessionToken.value);

    if (!user) {
      return NextResponse.json(null, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('檢查認證狀態失敗:', error);
    return NextResponse.json(
      { error: '認證檢查失敗' },
      { status: 500 }
    );
  }
}
