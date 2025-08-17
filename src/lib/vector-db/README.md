# Vector Database API 設計文檔

## 概述

這是一個支援多個向量資料庫的統一 API 設計，提供了一致的介面來操作不同的向量資料庫系統，包括 Milvus、Couchbase 等，並且具有良好的擴展性以支援更多向量資料庫。

## 架構設計

### 目錄結構

```
src/lib/vector-db/
├── types.ts                    # 核心類型定義
├── base/
│   └── BaseVectorDB.ts        # 抽象基類
├── adapters/
│   ├── MilvusAdapter.ts       # Milvus 適配器
│   ├── CouchbaseAdapter.ts    # Couchbase 適配器
│   └── ...                    # 其他資料庫適配器
├── VectorDBFactory.ts         # 工廠類別和管理器
├── index.ts                   # 統一導出
└── README.md                  # 說明文檔
```

### 核心組件

#### 1. 抽象介面 (IVectorDatabase)

定義了所有向量資料庫必須實現的標準操作：

- **連接管理**: `connect()`, `disconnect()`, `isConnected()`
- **集合管理**: `createCollection()`, `dropCollection()`, `hasCollection()`, `listCollections()`
- **向量操作**: `insert()`, `update()`, `delete()`, `search()`
- **索引管理**: `createIndex()`, `dropIndex()`
- **維護操作**: `flush()`, `compact()`

#### 2. 基礎抽象類別 (BaseVectorDB)

提供通用功能的實現：

- 連接狀態管理
- 參數驗證
- 錯誤處理
- 批量操作支援
- 向量計算工具

#### 3. 具體適配器

每個向量資料庫都有對應的適配器實現：

- **MilvusAdapter**: Milvus 向量資料庫適配器
- **CouchbaseAdapter**: Couchbase 向量資料庫適配器
- 支援擴展更多資料庫

#### 4. 工廠模式

- **VectorDBFactory**: 根據配置創建對應的資料庫實例
- **VectorDBManager**: 提供高級管理功能

## API 使用指南

### 基本使用

```typescript
import { VectorDBFactory, VectorDBConfig } from '@/lib/vector-db';

// 配置向量資料庫
const config: VectorDBConfig = {
  type: 'milvus',
  host: 'localhost',
  port: 19530,
  username: 'root',
  password: 'Milvus',
  database: 'default'
};

// 創建並連接
const vectorDB = await VectorDBFactory.createAndConnect(config);

// 創建集合
await vectorDB.createCollection({
  name: 'documents',
  dimension: 768,
  metricType: 'COSINE',
  description: 'Document embeddings'
});
```

### 向量操作

```typescript
// 插入向量
const vectors = [
  {
    id: 'doc1',
    embedding: [0.1, 0.2, 0.3, ...], // 768 維向量
    metadata: { 
      title: 'Document 1', 
      category: 'tech',
      created_at: '2024-01-01'
    }
  }
];

const insertResult = await vectorDB.insert('documents', vectors);

// 搜尋相似向量
const searchResults = await vectorDB.search('documents', {
  vector: [0.1, 0.2, 0.3, ...],
  topK: 10,
  filter: { category: 'tech' },
  threshold: 0.8
});

// 更新向量
await vectorDB.update('documents', updatedVectors);

// 刪除向量
await vectorDB.delete('documents', ['doc1', 'doc2']);
```

### 管理器使用

```typescript
import { VectorDBManager } from '@/lib/vector-db';

const manager = new VectorDBManager(config);
await manager.initialize();

// 健康檢查
const health = await manager.healthCheck();
console.log('Database status:', health);

// 重新連接
await manager.reconnect();

// 關閉連接
await manager.close();
```

## HTTP API 端點

### 基本操作

```bash
# 獲取資料庫狀態
GET /api/vector

# 執行向量操作
POST /api/vector
{
  "operation": "search",
  "collection": "documents",
  "data": {
    "vector": [0.1, 0.2, 0.3, ...],
    "topK": 10,
    "filter": { "category": "tech" }
  }
}

# 更新配置
PUT /api/vector
{
  "config": {
    "type": "milvus",
    "host": "localhost",
    "port": 19530
  }
}

# 關閉連接
DELETE /api/vector
```

### 批量操作

```bash
# 批量插入
POST /api/vector/batch
{
  "operation": "batchInsert",
  "collection": "documents",
  "data": {
    "vectors": [...]
  },
  "options": {
    "batchSize": 100,
    "delay": 1000
  }
}

# 批量搜尋
POST /api/vector/batch
{
  "operation": "batchSearch",
  "collection": "documents",
  "data": {
    "queries": [
      { "vector": [...], "topK": 10 },
      { "vector": [...], "topK": 5 }
    ]
  },
  "options": {
    "concurrency": 5
  }
}
```

## 支援的向量資料庫

### 1. Milvus

```typescript
const milvusConfig: VectorDBConfig = {
  type: 'milvus',
  host: 'localhost',
  port: 19530,
  username: 'root',
  password: 'Milvus'
};
```

**特點:**
- 高性能向量搜尋
- 支援多種索引類型
- 水平擴展
- 豐富的距離計算方式

### 2. Couchbase

```typescript
const couchbaseConfig: VectorDBConfig = {
  type: 'couchbase',
  host: 'localhost',
  port: 8091,
  username: 'admin',
  password: 'password',
  database: 'vectors'
};
```

**特點:**
- 文檔型資料庫
- 內建全文搜尋
- N1QL 查詢語言
- 分散式架構

### 3. 擴展支援

框架設計支援輕鬆添加新的向量資料庫：

```typescript
// 1. 實現適配器
class NewDBAdapter extends BaseVectorDB {
  async connect() { /* 實現連接邏輯 */ }
  async search() { /* 實現搜尋邏輯 */ }
  // ... 其他方法
}

// 2. 在工廠中註冊
// VectorDBFactory.create() 添加新類型支援
```

## 配置選項

### 環境變數

```bash
# 向量資料庫配置
VECTOR_DB_TYPE=milvus
VECTOR_DB_HOST=localhost
VECTOR_DB_PORT=19530
VECTOR_DB_USERNAME=root
VECTOR_DB_PASSWORD=Milvus
VECTOR_DB_DATABASE=default
VECTOR_DB_API_KEY=your-api-key
```

### 配置物件

```typescript
interface VectorDBConfig {
  type: 'milvus' | 'couchbase' | 'pinecone' | 'qdrant' | 'weaviate' | 'chroma';
  host: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  apiKey?: string;
  options?: Record<string, any>;
}
```

## 錯誤處理

### 統一錯誤格式

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
```

### 常見錯誤類型

- **連接錯誤**: 資料庫無法連接
- **配置錯誤**: 配置參數無效
- **操作錯誤**: 向量操作失敗
- **驗證錯誤**: 參數驗證失敗

## 性能優化

### 批量操作

- 支援自動分批處理
- 可配置批次大小
- 併發控制

### 連接池

- 實例重用
- 自動重連
- 連接狀態管理

### 快取機制

- 搜尋結果快取
- 連接資訊快取
- 配置快取

## 最佳實踐

### 1. 向量維度設計

```typescript
// 建議使用標準維度
const COMMON_DIMENSIONS = {
  BERT_BASE: 768,
  BERT_LARGE: 1024,
  SENTENCE_TRANSFORMER: 384,
  OPENAI_ADA: 1536
};
```

### 2. 索引策略

```typescript
// 根據資料規模選擇索引
const indexConfig = {
  small: 'FLAT',      // < 10K vectors
  medium: 'IVF_FLAT', // 10K - 1M vectors  
  large: 'IVF_PQ'     // > 1M vectors
};
```

### 3. 搜尋優化

```typescript
// 使用適當的 topK 值
const searchParams = {
  vector: embedding,
  topK: Math.min(50, actualNeeded), // 避免過大的 topK
  threshold: 0.7, // 設定相似度閾值
  filter: { category: 'relevant' } // 使用過濾減少搜尋空間
};
```

## 故障排除

### 連接問題

1. 檢查網路連通性
2. 驗證認證資訊
3. 確認服務狀態

### 性能問題

1. 檢查索引狀態
2. 優化搜尋參數
3. 監控資源使用

### 資料一致性

1. 使用事務操作
2. 實施重試機制
3. 監控資料同步

## 未來發展

### 計劃支援的功能

- [ ] 更多向量資料庫支援 (Pinecone, Qdrant, Weaviate, Chroma)
- [ ] 向量壓縮和量化
- [ ] 分散式搜尋
- [ ] 實時向量更新
- [ ] 向量版本管理
- [ ] 多模態向量支援

### 性能改進

- [ ] 連接池優化
- [ ] 智能快取策略
- [ ] 查詢優化器
- [ ] 自動擴縮容

## 貢獻指南

1. Fork 專案
2. 創建功能分支
3. 實現新的適配器或功能
4. 添加測試
5. 提交 Pull Request

## 授權

MIT License
