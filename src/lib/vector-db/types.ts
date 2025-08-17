// 向量類型定義
export interface Vector {
  id: string;
  embedding: number[];
  metadata: Record<string, any>;
}

// 搜尋結果
export interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

// 搜尋參數
export interface SearchParams {
  vector: number[];
  topK: number;
  filter?: Record<string, any>;
  threshold?: number;
}

// 集合/索引配置
export interface CollectionConfig {
  name: string;
  dimension: number;
  indexType?: string;
  metricType?: 'L2' | 'IP' | 'COSINE';
  description?: string;
}

// 向量資料庫連接配置
export interface VectorDBConfig {
  type: 'milvus' | 'couchbase' | 'pinecone' | 'qdrant' | 'weaviate' | 'chroma';
  host: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  apiKey?: string;
  options?: Record<string, any>;
}

// 批量操作結果
export interface BatchResult {
  success: boolean;
  insertedCount?: number;
  errors?: string[];
}

// 統計資訊
export interface CollectionStats {
  name: string;
  totalCount: number;
  dimension: number;
  indexType?: string;
  metricType?: string;
}

// 向量資料庫抽象介面
export interface IVectorDatabase {
  // 連接管理
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // 集合管理
  createCollection(config: CollectionConfig): Promise<void>;
  dropCollection(name: string): Promise<void>;
  hasCollection(name: string): Promise<boolean>;
  listCollections(): Promise<string[]>;
  getCollectionStats(name: string): Promise<CollectionStats>;

  // 向量操作
  insert(collection: string, vectors: Vector[]): Promise<BatchResult>;
  update(collection: string, vectors: Vector[]): Promise<BatchResult>;
  delete(collection: string, ids: string[]): Promise<BatchResult>;
  search(collection: string, params: SearchParams): Promise<SearchResult[]>;

  // 索引管理
  createIndex(collection: string, indexParams?: Record<string, any>): Promise<void>;
  dropIndex(collection: string): Promise<void>;

  // 實用方法
  flush(collection: string): Promise<void>;
  compact(collection: string): Promise<void>;
}
