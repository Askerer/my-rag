import { 
  IVectorDatabase, 
  VectorDBConfig, 
  Vector, 
  SearchParams, 
  SearchResult, 
  CollectionConfig, 
  BatchResult, 
  CollectionStats 
} from '../types';

export abstract class BaseVectorDB implements IVectorDatabase {
  protected config: VectorDBConfig;
  protected connected: boolean = false;

  constructor(config: VectorDBConfig) {
    this.config = config;
  }

  // 抽象方法 - 子類必須實現
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract createCollection(config: CollectionConfig): Promise<void>;
  abstract dropCollection(name: string): Promise<void>;
  abstract hasCollection(name: string): Promise<boolean>;
  abstract listCollections(): Promise<string[]>;
  abstract getCollectionStats(name: string): Promise<CollectionStats>;
  abstract insert(collection: string, vectors: Vector[]): Promise<BatchResult>;
  abstract update(collection: string, vectors: Vector[]): Promise<BatchResult>;
  abstract delete(collection: string, ids: string[]): Promise<BatchResult>;
  abstract search(collection: string, params: SearchParams): Promise<SearchResult[]>;
  abstract createIndex(collection: string, indexParams?: Record<string, any>): Promise<void>;
  abstract dropIndex(collection: string): Promise<void>;
  abstract flush(collection: string): Promise<void>;
  abstract compact(collection: string): Promise<void>;

  // 通用方法
  isConnected(): boolean {
    return this.connected;
  }

  protected setConnected(connected: boolean): void {
    this.connected = connected;
  }

  protected validateConnection(): void {
    if (!this.connected) {
      throw new Error('Database not connected. Please call connect() first.');
    }
  }

  protected validateCollectionName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Collection name must be a non-empty string');
    }
  }

  protected validateVectors(vectors: Vector[]): void {
    if (!Array.isArray(vectors) || vectors.length === 0) {
      throw new Error('Vectors must be a non-empty array');
    }

    for (const vector of vectors) {
      if (!vector.id || !Array.isArray(vector.embedding)) {
        throw new Error('Each vector must have an id and embedding array');
      }
    }
  }

  protected validateSearchParams(params: SearchParams): void {
    if (!Array.isArray(params.vector) || params.vector.length === 0) {
      throw new Error('Search vector must be a non-empty array');
    }

    if (!params.topK || params.topK <= 0) {
      throw new Error('topK must be a positive number');
    }
  }

  // 工具方法
  protected normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude === 0 ? vector : vector.map(val => val / magnitude);
  }

  protected calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
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
  }

  // 批量操作輔助方法
  protected async batchOperation<T>(
    items: T[],
    operation: (batch: T[]) => Promise<BatchResult>,
    batchSize: number = 100
  ): Promise<BatchResult> {
    const results: BatchResult[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const result = await operation(batch);
      results.push(result);
    }

    // 合併結果
    const totalInserted = results.reduce((sum, r) => sum + (r.insertedCount || 0), 0);
    const allErrors = results.flatMap(r => r.errors || []);
    const allSuccess = results.every(r => r.success);

    return {
      success: allSuccess,
      insertedCount: totalInserted,
      errors: allErrors.length > 0 ? allErrors : undefined
    };
  }

  // 錯誤處理
  protected handleError(error: any, operation: string): never {
    const message = error?.message || error?.toString() || 'Unknown error';
    throw new Error(`${this.config.type} ${operation} failed: ${message}`);
  }

  // 日誌記錄
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.config.type.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'error':
        console.error(logMessage, data || '');
        break;
    }
  }
}
