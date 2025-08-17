import { BaseVectorDB } from '../base/BaseVectorDB';
import { 
  Vector, 
  SearchParams, 
  SearchResult, 
  CollectionConfig, 
  BatchResult, 
  CollectionStats,
  VectorDBConfig 
} from '../types';

/**
 * Couchbase 向量資料庫適配器
 * 
 * 注意：這是一個模擬實現，實際使用時需要安裝 couchbase SDK
 * npm install couchbase
 */
export class CouchbaseAdapter extends BaseVectorDB {
  private cluster: any;
  private bucket: any;
  private scope: any;
  private collection: any;

  constructor(config: VectorDBConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    try {
      this.log('info', 'Connecting to Couchbase...');

      // 模擬連接 - 實際實現需要導入 Couchbase SDK
      // const couchbase = require('couchbase');
      // this.cluster = await couchbase.connect(
      //   `couchbase://${this.config.host}`,
      //   {
      //     username: this.config.username,
      //     password: this.config.password,
      //   }
      // );

      // 模擬連接成功
      this.cluster = {
        connected: true,
        bucket: (name: string) => ({
          scope: (scopeName: string) => ({
            collection: (collectionName: string) => ({
              get: (id: string) => Promise.resolve({ content: { id, embedding: [], metadata: {} } }),
              insert: (id: string, doc: any) => Promise.resolve({ cas: '123' }),
              upsert: (id: string, doc: any) => Promise.resolve({ cas: '123' }),
              remove: (id: string) => Promise.resolve({ cas: '123' }),
              exists: (id: string) => Promise.resolve({ exists: true }),
            })
          })
        }),
        query: (queryString: string, options?: any) => Promise.resolve({
          rows: [
            { 
              id: '1', 
              score: 0.95, 
              embedding: [0.1, 0.2, 0.3], 
              metadata: { title: 'Document 1' } 
            },
            { 
              id: '2', 
              score: 0.87, 
              embedding: [0.4, 0.5, 0.6], 
              metadata: { title: 'Document 2' } 
            }
          ]
        }),
        searchQuery: (indexName: string, searchRequest: any) => Promise.resolve({
          rows: [
            { 
              id: '1', 
              score: 0.95, 
              fields: { embedding: [0.1, 0.2, 0.3], metadata: { title: 'Document 1' } }
            }
          ]
        }),
        analyticsQuery: (queryString: string) => Promise.resolve({
          rows: [{ count: 1000 }]
        })
      };

      const bucketName = this.config.database || 'vectors';
      this.bucket = this.cluster.bucket(bucketName);
      this.scope = this.bucket.scope('_default');
      this.collection = this.scope.collection('_default');

      this.setConnected(true);
      this.log('info', 'Successfully connected to Couchbase');
    } catch (error) {
      this.handleError(error, 'connection');
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.cluster) {
        // 實際實現: await this.cluster.close();
        this.cluster = null;
        this.bucket = null;
        this.scope = null;
        this.collection = null;
      }
      this.setConnected(false);
      this.log('info', 'Disconnected from Couchbase');
    } catch (error) {
      this.handleError(error, 'disconnection');
    }
  }

  async createCollection(config: CollectionConfig): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(config.name);

    try {
      // Couchbase 中的 "collection" 概念不同，這裡我們創建一個索引
      const indexQuery = `
        CREATE INDEX IF NOT EXISTS idx_${config.name}_vector 
        ON \`${this.config.database || 'vectors'}\`(embedding) 
        WHERE type = '${config.name}'
      `;

      await this.cluster.query(indexQuery);

      // 創建全文搜尋索引（如果支援向量搜尋）
      const vectorIndexDefinition = {
        type: 'fulltext-index',
        name: `${config.name}_vector_index`,
        sourceType: 'couchbase',
        sourceName: this.config.database || 'vectors',
        planParams: {
          maxPartitionsPerPIndex: 171,
          indexPartitions: 6
        },
        params: {
          mapping: {
            default_mapping: {
              enabled: false
            },
            types: {
              [config.name]: {
                enabled: true,
                properties: {
                  embedding: {
                    enabled: true,
                    dynamic: false,
                    fields: [
                      {
                        name: 'embedding',
                        type: 'vector',
                        dims: config.dimension,
                        similarity: config.metricType === 'COSINE' ? 'dot_product' : 'l2_norm'
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      };

      // 注意：實際實現需要使用 Couchbase Search API
      this.log('info', `Collection '${config.name}' index created successfully`);
    } catch (error) {
      this.handleError(error, 'create collection');
    }
  }

  async dropCollection(name: string): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(name);

    try {
      // 刪除索引
      const dropIndexQuery = `DROP INDEX IF EXISTS idx_${name}_vector ON \`${this.config.database || 'vectors'}\``;
      await this.cluster.query(dropIndexQuery);

      // 刪除所有相關文檔
      const deleteQuery = `DELETE FROM \`${this.config.database || 'vectors'}\` WHERE type = '${name}'`;
      await this.cluster.query(deleteQuery);

      this.log('info', `Collection '${name}' dropped successfully`);
    } catch (error) {
      this.handleError(error, 'drop collection');
    }
  }

  async hasCollection(name: string): Promise<boolean> {
    this.validateConnection();
    this.validateCollectionName(name);

    try {
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM system:indexes 
        WHERE name = 'idx_${name}_vector'
      `;
      
      const result = await this.cluster.query(checkQuery);
      return result.rows[0]?.count > 0;
    } catch (error) {
      this.log('warn', `Error checking collection existence: ${error.message}`);
      return false;
    }
  }

  async listCollections(): Promise<string[]> {
    this.validateConnection();

    try {
      const query = `
        SELECT DISTINCT SUBSTR(name, 5, LENGTH(name) - 10) as collection_name
        FROM system:indexes 
        WHERE name LIKE 'idx_%_vector'
      `;
      
      const result = await this.cluster.query(query);
      return result.rows.map((row: any) => row.collection_name);
    } catch (error) {
      this.handleError(error, 'list collections');
    }
  }

  async getCollectionStats(name: string): Promise<CollectionStats> {
    this.validateConnection();
    this.validateCollectionName(name);

    try {
      const countQuery = `
        SELECT COUNT(*) as count 
        FROM \`${this.config.database || 'vectors'}\` 
        WHERE type = '${name}'
      `;
      
      const result = await this.cluster.analyticsQuery(countQuery);
      const count = result.rows[0]?.count || 0;

      return {
        name,
        totalCount: count,
        dimension: 0, // 需要從實際文檔中獲取
        indexType: 'FLAT',
        metricType: 'L2'
      };
    } catch (error) {
      this.handleError(error, 'get collection stats');
    }
  }

  async insert(collection: string, vectors: Vector[]): Promise<BatchResult> {
    this.validateConnection();
    this.validateCollectionName(collection);
    this.validateVectors(vectors);

    try {
      const insertPromises = vectors.map(async (vector) => {
        const document = {
          type: collection,
          id: vector.id,
          embedding: vector.embedding,
          metadata: vector.metadata,
          created_at: new Date().toISOString()
        };

        return this.collection.insert(vector.id, document);
      });

      await Promise.all(insertPromises);

      this.log('info', `Inserted ${vectors.length} vectors into '${collection}'`);

      return {
        success: true,
        insertedCount: vectors.length
      };
    } catch (error) {
      this.log('error', 'Insert operation failed', error);
      return {
        success: false,
        insertedCount: 0,
        errors: [error.message]
      };
    }
  }

  async update(collection: string, vectors: Vector[]): Promise<BatchResult> {
    this.validateConnection();
    this.validateCollectionName(collection);
    this.validateVectors(vectors);

    try {
      const updatePromises = vectors.map(async (vector) => {
        const document = {
          type: collection,
          id: vector.id,
          embedding: vector.embedding,
          metadata: vector.metadata,
          updated_at: new Date().toISOString()
        };

        return this.collection.upsert(vector.id, document);
      });

      await Promise.all(updatePromises);

      this.log('info', `Updated ${vectors.length} vectors in '${collection}'`);

      return {
        success: true,
        insertedCount: vectors.length
      };
    } catch (error) {
      this.log('error', 'Update operation failed', error);
      return {
        success: false,
        insertedCount: 0,
        errors: [error.message]
      };
    }
  }

  async delete(collection: string, ids: string[]): Promise<BatchResult> {
    this.validateConnection();
    this.validateCollectionName(collection);

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('IDs must be a non-empty array');
    }

    try {
      const deletePromises = ids.map(id => this.collection.remove(id));
      await Promise.all(deletePromises);

      this.log('info', `Deleted ${ids.length} vectors from '${collection}'`);

      return {
        success: true,
        insertedCount: ids.length
      };
    } catch (error) {
      this.log('error', 'Delete operation failed', error);
      return {
        success: false,
        insertedCount: 0,
        errors: [error.message]
      };
    }
  }

  async search(collection: string, params: SearchParams): Promise<SearchResult[]> {
    this.validateConnection();
    this.validateCollectionName(collection);
    this.validateSearchParams(params);

    try {
      // 使用 Couchbase Vector Search (如果可用)
      const searchRequest = {
        knn: [
          {
            field: 'embedding',
            vector: params.vector,
            k: params.topK
          }
        ],
        query: params.filter ? this.buildCouchbaseQuery(params.filter) : { match_all: {} }
      };

      const result = await this.cluster.searchQuery(
        `${collection}_vector_index`,
        searchRequest
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        score: row.score,
        metadata: row.fields?.metadata || {}
      }));
    } catch (error) {
      // 降級到 N1QL 查詢 + 客戶端向量相似度計算
      return this.searchWithN1QL(collection, params);
    }
  }

  private async searchWithN1QL(collection: string, params: SearchParams): Promise<SearchResult[]> {
    try {
      // 獲取所有向量（在實際應用中需要優化）
      const query = `
        SELECT META().id, embedding, metadata 
        FROM \`${this.config.database || 'vectors'}\` 
        WHERE type = '${collection}'
        ${params.filter ? 'AND ' + this.buildN1QLFilter(params.filter) : ''}
      `;

      const result = await this.cluster.query(query);
      
      // 計算相似度並排序
      const scores = result.rows.map((row: any) => {
        const similarity = this.calculateCosineSimilarity(params.vector, row.embedding);
        return {
          id: row.id,
          score: similarity,
          metadata: row.metadata || {}
        };
      });

      // 按分數排序並返回 top-k
      return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, params.topK)
        .filter(item => !params.threshold || item.score >= params.threshold);
    } catch (error) {
      this.handleError(error, 'N1QL search');
    }
  }

  async createIndex(collection: string, indexParams?: Record<string, any>): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(collection);

    try {
      // 創建向量搜尋索引已在 createCollection 中處理
      this.log('info', `Index for collection '${collection}' already exists`);
    } catch (error) {
      this.handleError(error, 'create index');
    }
  }

  async dropIndex(collection: string): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(collection);

    try {
      const dropQuery = `DROP INDEX IF EXISTS idx_${collection}_vector ON \`${this.config.database || 'vectors'}\``;
      await this.cluster.query(dropQuery);

      this.log('info', `Index dropped for collection '${collection}'`);
    } catch (error) {
      this.handleError(error, 'drop index');
    }
  }

  async flush(collection: string): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(collection);

    try {
      // Couchbase 自動持久化，這裡可以觸發索引重建
      this.log('info', `Collection '${collection}' flushed (no-op for Couchbase)`);
    } catch (error) {
      this.handleError(error, 'flush');
    }
  }

  async compact(collection: string): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(collection);

    try {
      // Couchbase 自動壓縮，這裡可以觸發手動壓縮
      this.log('info', `Collection '${collection}' compacted (no-op for Couchbase)`);
    } catch (error) {
      this.handleError(error, 'compact');
    }
  }

  private buildCouchbaseQuery(filter: Record<string, any>): any {
    // 建立 Couchbase Search Query
    const should: any[] = [];

    Object.entries(filter).forEach(([key, value]) => {
      if (typeof value === 'string') {
        should.push({ term: { [`metadata.${key}`]: value } });
      } else if (typeof value === 'number') {
        should.push({ term: { [`metadata.${key}`]: value } });
      } else if (Array.isArray(value)) {
        should.push({ terms: { [`metadata.${key}`]: value } });
      }
    });

    return should.length === 1 ? should[0] : { bool: { should } };
  }

  private buildN1QLFilter(filter: Record<string, any>): string {
    // 建立 N1QL WHERE 條件
    const conditions = Object.entries(filter).map(([key, value]) => {
      if (typeof value === 'string') {
        return `metadata.${key} = "${value}"`;
      } else if (typeof value === 'number') {
        return `metadata.${key} = ${value}`;
      } else if (Array.isArray(value)) {
        const values = value.map(v => typeof v === 'string' ? `"${v}"` : v).join(',');
        return `metadata.${key} IN [${values}]`;
      }
      return '';
    }).filter(condition => condition !== '');

    return conditions.join(' AND ');
  }
}
