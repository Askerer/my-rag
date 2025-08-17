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
 * Milvus 向量資料庫適配器
 * 
 * 注意：這是一個模擬實現，實際使用時需要安裝 @zilliz/milvus2-sdk-node
 * npm install @zilliz/milvus2-sdk-node
 */
export class MilvusAdapter extends BaseVectorDB {
  private client: any; // 實際應該是 MilvusClient 類型

  constructor(config: VectorDBConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    try {
      this.log('info', 'Connecting to Milvus...');
      
      // 模擬連接 - 實際實現需要導入 Milvus SDK
      // const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
      // this.client = new MilvusClient({
      //   address: `${this.config.host}:${this.config.port || 19530}`,
      //   username: this.config.username,
      //   password: this.config.password,
      //   ssl: this.config.options?.ssl || false,
      // });

      // 模擬連接成功
      this.client = {
        connected: true,
        // 模擬方法
        checkHealth: () => Promise.resolve({ isHealthy: true }),
        createCollection: (params: any) => Promise.resolve({ error_code: 'Success' }),
        dropCollection: (params: any) => Promise.resolve({ error_code: 'Success' }),
        hasCollection: (params: any) => Promise.resolve({ value: true }),
        showCollections: () => Promise.resolve({ 
          data: [{ name: 'test_collection' }],
          status: { error_code: 'Success' }
        }),
        insert: (params: any) => Promise.resolve({ 
          IDs: { int_id: { data: [1, 2, 3] } },
          status: { error_code: 'Success' }
        }),
        search: (params: any) => Promise.resolve({
          results: [
            { score: 0.95, id: '1' },
            { score: 0.87, id: '2' }
          ],
          status: { error_code: 'Success' }
        }),
        deleteEntities: (params: any) => Promise.resolve({ status: { error_code: 'Success' } }),
        createIndex: (params: any) => Promise.resolve({ status: { error_code: 'Success' } }),
        dropIndex: (params: any) => Promise.resolve({ status: { error_code: 'Success' } }),
        flush: (params: any) => Promise.resolve({ status: { error_code: 'Success' } }),
        compact: (params: any) => Promise.resolve({ status: { error_code: 'Success' } }),
        getCollectionStatistics: (params: any) => Promise.resolve({
          stats: [{ key: 'row_count', value: '1000' }],
          status: { error_code: 'Success' }
        })
      };

      // 檢查連接
      const health = await this.client.checkHealth();
      if (!health.isHealthy) {
        throw new Error('Milvus health check failed');
      }

      this.setConnected(true);
      this.log('info', 'Successfully connected to Milvus');
    } catch (error) {
      this.handleError(error, 'connection');
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        // 實際實現: await this.client.closeConnection();
        this.client = null;
      }
      this.setConnected(false);
      this.log('info', 'Disconnected from Milvus');
    } catch (error) {
      this.handleError(error, 'disconnection');
    }
  }

  async createCollection(config: CollectionConfig): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(config.name);

    try {
      const createParams = {
        collection_name: config.name,
        description: config.description || `Collection for ${config.name}`,
        fields: [
          {
            name: 'id',
            data_type: 'VarChar',
            max_length: 255,
            is_primary_key: true
          },
          {
            name: 'embedding',
            data_type: 'FloatVector',
            dimension: config.dimension
          },
          {
            name: 'metadata',
            data_type: 'JSON'
          }
        ]
      };

      const result = await this.client.createCollection(createParams);
      
      if (result.error_code !== 'Success') {
        throw new Error(`Failed to create collection: ${result.reason}`);
      }

      this.log('info', `Collection '${config.name}' created successfully`);
    } catch (error) {
      this.handleError(error, 'create collection');
    }
  }

  async dropCollection(name: string): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(name);

    try {
      const result = await this.client.dropCollection({
        collection_name: name
      });

      if (result.error_code !== 'Success') {
        throw new Error(`Failed to drop collection: ${result.reason}`);
      }

      this.log('info', `Collection '${name}' dropped successfully`);
    } catch (error) {
      this.handleError(error, 'drop collection');
    }
  }

  async hasCollection(name: string): Promise<boolean> {
    this.validateConnection();
    this.validateCollectionName(name);

    try {
      const result = await this.client.hasCollection({
        collection_name: name
      });

      return result.value || false;
    } catch (error) {
      this.handleError(error, 'check collection existence');
    }
  }

  async listCollections(): Promise<string[]> {
    this.validateConnection();

    try {
      const result = await this.client.showCollections();
      
      if (result.status?.error_code !== 'Success') {
        throw new Error(`Failed to list collections: ${result.status?.reason}`);
      }

      return result.data?.map((col: any) => col.name) || [];
    } catch (error) {
      this.handleError(error, 'list collections');
    }
  }

  async getCollectionStats(name: string): Promise<CollectionStats> {
    this.validateConnection();
    this.validateCollectionName(name);

    try {
      const result = await this.client.getCollectionStatistics({
        collection_name: name
      });

      if (result.status?.error_code !== 'Success') {
        throw new Error(`Failed to get collection stats: ${result.status?.reason}`);
      }

      const stats = result.stats || [];
      const rowCount = stats.find((s: any) => s.key === 'row_count')?.value || '0';

      return {
        name,
        totalCount: parseInt(rowCount),
        dimension: 0, // 需要從 collection 描述中獲取
        indexType: 'IVF_FLAT', // 預設值
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
      const insertParams = {
        collection_name: collection,
        fields_data: [
          {
            field_name: 'id',
            type: 'VarChar',
            data: vectors.map(v => v.id)
          },
          {
            field_name: 'embedding',
            type: 'FloatVector',
            data: vectors.map(v => v.embedding)
          },
          {
            field_name: 'metadata',
            type: 'JSON',
            data: vectors.map(v => JSON.stringify(v.metadata))
          }
        ]
      };

      const result = await this.client.insert(insertParams);

      if (result.status?.error_code !== 'Success') {
        throw new Error(`Insert failed: ${result.status?.reason}`);
      }

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
    // Milvus 不直接支援更新，需要先刪除再插入
    this.validateConnection();
    this.validateCollectionName(collection);
    this.validateVectors(vectors);

    try {
      const ids = vectors.map(v => v.id);
      await this.delete(collection, ids);
      return await this.insert(collection, vectors);
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
      const deleteParams = {
        collection_name: collection,
        expr: `id in [${ids.map(id => `"${id}"`).join(',')}]`
      };

      const result = await this.client.deleteEntities(deleteParams);

      if (result.status?.error_code !== 'Success') {
        throw new Error(`Delete failed: ${result.status?.reason}`);
      }

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
      const searchParams = {
        collection_name: collection,
        vectors: [params.vector],
        search_params: {
          anns_field: 'embedding',
          topk: params.topK,
          metric_type: 'L2',
          params: JSON.stringify({ nprobe: 10 })
        },
        output_fields: ['id', 'metadata'],
        expr: params.filter ? this.buildFilterExpression(params.filter) : undefined
      };

      const result = await this.client.search(searchParams);

      if (result.status?.error_code !== 'Success') {
        throw new Error(`Search failed: ${result.status?.reason}`);
      }

      return result.results?.map((item: any) => ({
        id: item.id,
        score: item.score,
        metadata: item.metadata ? JSON.parse(item.metadata) : {}
      })) || [];
    } catch (error) {
      this.handleError(error, 'search');
    }
  }

  async createIndex(collection: string, indexParams?: Record<string, any>): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(collection);

    try {
      const params = {
        collection_name: collection,
        field_name: 'embedding',
        index_type: indexParams?.index_type || 'IVF_FLAT',
        metric_type: indexParams?.metric_type || 'L2',
        params: JSON.stringify(indexParams?.params || { nlist: 1024 })
      };

      const result = await this.client.createIndex(params);

      if (result.status?.error_code !== 'Success') {
        throw new Error(`Create index failed: ${result.status?.reason}`);
      }

      this.log('info', `Index created for collection '${collection}'`);
    } catch (error) {
      this.handleError(error, 'create index');
    }
  }

  async dropIndex(collection: string): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(collection);

    try {
      const result = await this.client.dropIndex({
        collection_name: collection,
        field_name: 'embedding'
      });

      if (result.status?.error_code !== 'Success') {
        throw new Error(`Drop index failed: ${result.status?.reason}`);
      }

      this.log('info', `Index dropped for collection '${collection}'`);
    } catch (error) {
      this.handleError(error, 'drop index');
    }
  }

  async flush(collection: string): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(collection);

    try {
      const result = await this.client.flush({
        collection_names: [collection]
      });

      if (result.status?.error_code !== 'Success') {
        throw new Error(`Flush failed: ${result.status?.reason}`);
      }

      this.log('info', `Collection '${collection}' flushed successfully`);
    } catch (error) {
      this.handleError(error, 'flush');
    }
  }

  async compact(collection: string): Promise<void> {
    this.validateConnection();
    this.validateCollectionName(collection);

    try {
      const result = await this.client.compact({
        collection_name: collection
      });

      if (result.status?.error_code !== 'Success') {
        throw new Error(`Compact failed: ${result.status?.reason}`);
      }

      this.log('info', `Collection '${collection}' compacted successfully`);
    } catch (error) {
      this.handleError(error, 'compact');
    }
  }

  private buildFilterExpression(filter: Record<string, any>): string {
    // 簡單的過濾器表達式構建
    const expressions = Object.entries(filter).map(([key, value]) => {
      if (typeof value === 'string') {
        return `metadata["${key}"] == "${value}"`;
      } else if (typeof value === 'number') {
        return `metadata["${key}"] == ${value}`;
      } else if (Array.isArray(value)) {
        return `metadata["${key}"] in [${value.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')}]`;
      }
      return '';
    }).filter(expr => expr !== '');

    return expressions.join(' and ');
  }
}
