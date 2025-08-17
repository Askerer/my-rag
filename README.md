# AI RAG Platform

一個基於 Next.js 的智能文檔檢索與問答系統 (RAG - Retrieval-Augmented Generation)。

## 功能特色

### 📁 文件上傳
- 支持多種文件格式：PDF, DOCX, TXT, MD
- 拖拽上傳界面
- 文件大小顯示
- 批量文件處理

### ⚙️ RAG 配置
- **文本分塊大小**：可調整文檔分塊的字符數 (建議 500-2000)
- **分塊重疊**：設置相鄰分塊之間的重疊字符數 (建議 10-20%)
- **嵌入模型**：選擇不同的文本嵌入模型
  - OpenAI Ada-002
  - OpenAI 3-Small
  - OpenAI 3-Large
  - Sentence Transformers
- **向量數據庫**：選擇向量存儲方案
  - FAISS
  - Pinecone
  - Weaviate
  - Chroma
- **相似度閾值**：設置檢索結果的相似度閾值 (0.0-1.0)

### 💬 智能問答
- 實時聊天界面
- 基於上傳文檔的智能回答
- 消息歷史記錄
- 加載狀態指示

## 技術棧

- **前端框架**：Next.js 15.4.5
- **UI 組件**：React 19.1.0
- **樣式**：Tailwind CSS 4
- **圖標**：Lucide React
- **語言**：TypeScript

## 快速開始

### 安裝依賴
```bash
npm install
```

### 啟動開發服務器
```bash
npm run dev
```

### 訪問應用
打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 項目結構

```
src/
├── app/
│   ├── page.tsx          # 主頁面
│   ├── layout.tsx        # 應用布局
│   └── globals.css       # 全局樣式
└── components/
    ├── FileUpload.tsx    # 文件上傳組件
    ├── RAGConfig.tsx     # RAG 配置組件
    └── ChatInterface.tsx # 聊天界面組件
```

## 開發計劃

### 已完成 ✅
- [x] 文件上傳界面
- [x] RAG 配置選項
- [x] 聊天界面
- [x] 響應式設計
- [x] 組件化架構

### 待開發 🚧
- [ ] 後端 API 集成
- [ ] 文件處理邏輯
- [ ] 向量數據庫連接
- [ ] 真實的 RAG 實現
- [ ] 用戶認證
- [ ] 文件管理
- [ ] 對話歷史保存

## 使用說明

1. **上傳文件**：點擊或拖拽文件到上傳區域
2. **配置 RAG**：調整分塊大小、嵌入模型等參數
3. **開始對話**：在聊天界面輸入問題，AI 會基於上傳的文檔回答

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 許可證

MIT License
