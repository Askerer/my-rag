import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const knowledgeBaseId = formData.get('knowledgeBaseId') as string | null;
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: '沒有找到上傳的文件' },
        { status: 400 }
      );
    }

    // 驗證文件類型
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `不支持的文件類型: ${file.type}` },
          { status: 400 }
        );
      }
    }

    // TODO: 這裡應該實現實際的文件處理邏輯
    // 1. 保存文件到服務器
    // 2. 提取文本內容
    // 3. 進行文本分塊
    // 4. 生成嵌入向量
    // 5. 存儲到向量數據庫

    // 模擬處理時間
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 返回詳細的文件信息
    const processedFiles = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      status: 'completed',
      chunks: Math.floor(Math.random() * 50) + 10, // 模擬文本塊數量
      content: `這是 ${file.name} 的內容預覽...`, // 模擬文件內容
    }));

    return NextResponse.json({
      success: true,
      message: `成功處理 ${files.length} 個文件` + (knowledgeBaseId ? `（已加入知識庫 ${knowledgeBaseId}）` : ''),
      files: processedFiles
    });

  } catch (error) {
    console.error('文件上傳錯誤:', error);
    return NextResponse.json(
      { error: '文件上傳失敗' },
      { status: 500 }
    );
  }
} 