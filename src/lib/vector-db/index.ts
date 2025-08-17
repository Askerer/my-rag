/**
 * Vector Database Library
 * 
 * 提供統一的向量資料庫抽象層，支援多種向量資料庫：
 * - Milvus
 * - Couchbase
 * - Pinecone (待實現)
 * - Qdrant (待實現)
 * - Weaviate (待實現)
 * - Chroma (待實現)
 */

// 核心類型定義
export type {
  Vector,
  SearchResult,
  SearchParams,
  CollectionConfig,
  VectorDBConfig,
  BatchResult,
  CollectionStats,
  IVectorDatabase
} from './types';

// 基礎抽象類別
export { BaseVectorDB } from './base/BaseVectorDB';

// 具體實現的適配器
export { MilvusAdapter } from './adapters/MilvusAdapter';
export { CouchbaseAdapter } from './adapters/CouchbaseAdapter';

// 工廠和管理器
export { VectorDBFactory, VectorDBManager } from './VectorDBFactory';

// 預設導出工廠類別
export default VectorDBFactory;

/**
 * 快速開始範例
 * 
 * ```typescript
 * import { VectorDBFactory, VectorDBConfig } from '@/lib/vector-db';
 * 
 * const config: VectorDBConfig = {
 *   type: 'milvus',
 *   host: 'localhost',
 *   port: 19530,
 *   username: 'root',
 *   password: 'Milvus'
 * };
 * 
 * const vectorDB = await VectorDBFactory.createAndConnect(config);
 * 
 * // 創建集合
 * await vectorDB.createCollection({
 *   name: 'documents',
 *   dimension: 768,
 *   metricType: 'COSINE'
 * });
 * 
 * // 插入向量
 * await vectorDB.insert('documents', [
 *   {
 *     id: 'doc1',
 *     embedding: [0.1, 0.2, 0.3, ...],
 *     metadata: { title: 'Document 1', type: 'pdf' }
 *   }
 * ]);
 * 
 * // 搜尋相似向量
 * const results = await vectorDB.search('documents', {
 *   vector: [0.1, 0.2, 0.3, ...],
 *   topK: 10,
 *   filter: { type: 'pdf' }
 * });
 * ```
 */

/**
 * 支援的向量資料庫類型
 */
export const SUPPORTED_VECTOR_DBS = [
  'milvus',
  'couchbase', 
  'pinecone',
  'qdrant',
  'weaviate',
  'chroma'
] as const;

/**
 * 預設配置
 */
export const DEFAULT_CONFIGS = {
  milvus: {
    port: 19530,
    metricType: 'COSINE' as const,
    indexType: 'IVF_FLAT'
  },
  couchbase: {
    port: 8091,
    metricType: 'COSINE' as const
  },
  pinecone: {
    metricType: 'COSINE' as const
  }
} as const;

/**
 * 工具函數
 */
export const VectorDBUtils = {
  /**
   * 驗證向量維度
   */
  validateDimension(vectors: number[][], expectedDim?: number): boolean {
    if (vectors.length === 0) return true;
    
    const firstDim = vectors[0].length;
    const allSameDim = vectors.every(v => v.length === firstDim);
    
    if (!allSameDim) return false;
    if (expectedDim && firstDim !== expectedDim) return false;
    
    return true;
  },

  /**
   * 正規化向量
   */
  normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude === 0 ? vector : vector.map(val => val / magnitude);
  },

  /**
   * 計算餘弦相似度
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  },

  /**
   * 計算歐幾里得距離
   */
  euclideanDistance(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimension');
    }

    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
      const diff = vecA[i] - vecB[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  },

  /**
   * 生成隨機向量
   */
  generateRandomVector(dimension: number, normalize = true): number[] {
    const vector = Array.from({ length: dimension }, () => Math.random() - 0.5);
    return normalize ? this.normalizeVector(vector) : vector;
  },

  /**
   * 批量生成隨機向量
   */
  generateRandomVectors(count: number, dimension: number, normalize = true): number[][] {
    return Array.from({ length: count }, () => this.generateRandomVector(dimension, normalize));
  }
};
