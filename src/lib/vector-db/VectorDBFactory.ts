import { VectorDBConfig, IVectorDatabase } from './types';
import { MilvusAdapter } from './adapters/MilvusAdapter';
import { CouchbaseAdapter } from './adapters/CouchbaseAdapter';

/**
 * 向量資料庫工廠類別
 * 負責根據配置創建對應的向量資料庫實例
 */
export class VectorDBFactory {
  private static instances: Map<string, IVectorDatabase> = new Map();

  /**
   * 創建向量資料庫實例
   * @param config 向量資料庫配置
   * @returns 向量資料庫實例
   */
  static create(config: VectorDBConfig): IVectorDatabase {
    const instanceKey = this.generateInstanceKey(config);
    
    // 檢查是否已存在實例
    if (this.instances.has(instanceKey)) {
      const instance = this.instances.get(instanceKey)!;
      if (instance.isConnected()) {
        return instance;
      }
      // 如果實例存在但未連接，則刪除並重新創建
      this.instances.delete(instanceKey);
    }

    let instance: IVectorDatabase;

    switch (config.type) {
      case 'milvus':
        instance = new MilvusAdapter(config);
        break;
      
      case 'couchbase':
        instance = new CouchbaseAdapter(config);
        break;
      
      case 'pinecone':
        // 可以添加 Pinecone 適配器
        throw new Error('Pinecone adapter not implemented yet');
      
      case 'qdrant':
        // 可以添加 Qdrant 適配器
        throw new Error('Qdrant adapter not implemented yet');
      
      case 'weaviate':
        // 可以添加 Weaviate 適配器
        throw new Error('Weaviate adapter not implemented yet');
      
      case 'chroma':
        // 可以添加 Chroma 適配器
        throw new Error('Chroma adapter not implemented yet');
      
      default:
        throw new Error(`Unsupported vector database type: ${config.type}`);
    }

    // 緩存實例
    this.instances.set(instanceKey, instance);
    return instance;
  }

  /**
   * 獲取現有實例
   * @param config 向量資料庫配置
   * @returns 向量資料庫實例或 null
   */
  static getInstance(config: VectorDBConfig): IVectorDatabase | null {
    const instanceKey = this.generateInstanceKey(config);
    return this.instances.get(instanceKey) || null;
  }

  /**
   * 創建並連接向量資料庫實例
   * @param config 向量資料庫配置
   * @returns 已連接的向量資料庫實例
   */
  static async createAndConnect(config: VectorDBConfig): Promise<IVectorDatabase> {
    const instance = this.create(config);
    
    if (!instance.isConnected()) {
      await instance.connect();
    }
    
    return instance;
  }

  /**
   * 關閉指定實例的連接
   * @param config 向量資料庫配置
   */
  static async disconnect(config: VectorDBConfig): Promise<void> {
    const instanceKey = this.generateInstanceKey(config);
    const instance = this.instances.get(instanceKey);
    
    if (instance && instance.isConnected()) {
      await instance.disconnect();
    }
  }

  /**
   * 關閉所有實例的連接
   */
  static async disconnectAll(): Promise<void> {
    const disconnectPromises: Promise<void>[] = [];
    
    for (const instance of this.instances.values()) {
      if (instance.isConnected()) {
        disconnectPromises.push(instance.disconnect());
      }
    }
    
    await Promise.all(disconnectPromises);
    this.instances.clear();
  }

  /**
   * 移除指定實例
   * @param config 向量資料庫配置
   */
  static async removeInstance(config: VectorDBConfig): Promise<void> {
    const instanceKey = this.generateInstanceKey(config);
    const instance = this.instances.get(instanceKey);
    
    if (instance) {
      if (instance.isConnected()) {
        await instance.disconnect();
      }
      this.instances.delete(instanceKey);
    }
  }

  /**
   * 獲取所有活躍實例的狀態
   * @returns 實例狀態列表
   */
  static getAllInstancesStatus(): Array<{
    key: string;
    type: string;
    connected: boolean;
    host: string;
  }> {
    const statuses: Array<{
      key: string;
      type: string;
      connected: boolean;
      host: string;
    }> = [];

    for (const [key, instance] of this.instances.entries()) {
      const [type, host] = key.split('://');
      statuses.push({
        key,
        type,
        connected: instance.isConnected(),
        host
      });
    }

    return statuses;
  }

  /**
   * 驗證配置
   * @param config 向量資料庫配置
   * @throws {Error} 配置無效時拋出錯誤
   */
  static validateConfig(config: VectorDBConfig): void {
    if (!config.type) {
      throw new Error('Vector database type is required');
    }

    if (!config.host) {
      throw new Error('Vector database host is required');
    }

    // 根據不同類型驗證特定配置
    switch (config.type) {
      case 'milvus':
        if (config.port && (config.port < 1 || config.port > 65535)) {
          throw new Error('Invalid port number for Milvus');
        }
        break;
      
      case 'couchbase':
        if (!config.username || !config.password) {
          throw new Error('Username and password are required for Couchbase');
        }
        break;
      
      case 'pinecone':
        if (!config.apiKey) {
          throw new Error('API key is required for Pinecone');
        }
        break;
      
      // 可以添加其他資料庫的驗證規則
    }
  }

  /**
   * 生成實例鍵值
   * @param config 向量資料庫配置
   * @returns 實例鍵值
   */
  private static generateInstanceKey(config: VectorDBConfig): string {
    const host = config.host;
    const port = config.port ? `:${config.port}` : '';
    const database = config.database ? `/${config.database}` : '';
    const username = config.username ? `${config.username}@` : '';
    
    return `${config.type}://${username}${host}${port}${database}`;
  }

  /**
   * 獲取支援的向量資料庫類型
   * @returns 支援的資料庫類型列表
   */
  static getSupportedTypes(): string[] {
    return ['milvus', 'couchbase', 'pinecone', 'qdrant', 'weaviate', 'chroma'];
  }

  /**
   * 檢查是否支援指定的資料庫類型
   * @param type 資料庫類型
   * @returns 是否支援
   */
  static isTypeSupported(type: string): boolean {
    return this.getSupportedTypes().includes(type);
  }
}

/**
 * 向量資料庫管理器
 * 提供高級的向量資料庫管理功能
 */
export class VectorDBManager {
  private defaultConfig: VectorDBConfig;
  private instance: IVectorDatabase;

  constructor(config: VectorDBConfig) {
    VectorDBFactory.validateConfig(config);
    this.defaultConfig = config;
    this.instance = VectorDBFactory.create(config);
  }

  /**
   * 初始化連接
   */
  async initialize(): Promise<void> {
    if (!this.instance.isConnected()) {
      await this.instance.connect();
    }
  }

  /**
   * 獲取向量資料庫實例
   */
  getInstance(): IVectorDatabase {
    return this.instance;
  }

  /**
   * 檢查連接狀態
   */
  isConnected(): boolean {
    return this.instance.isConnected();
  }

  /**
   * 重新連接
   */
  async reconnect(): Promise<void> {
    if (this.instance.isConnected()) {
      await this.instance.disconnect();
    }
    await this.instance.connect();
  }

  /**
   * 關閉連接
   */
  async close(): Promise<void> {
    if (this.instance.isConnected()) {
      await this.instance.disconnect();
    }
  }

  /**
   * 獲取配置資訊
   */
  getConfig(): VectorDBConfig {
    return { ...this.defaultConfig };
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<{
    connected: boolean;
    type: string;
    host: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const collections = await this.instance.listCollections();
      const responseTime = Date.now() - startTime;
      
      return {
        connected: true,
        type: this.defaultConfig.type,
        host: this.defaultConfig.host,
        responseTime
      };
    } catch (error) {
      return {
        connected: false,
        type: this.defaultConfig.type,
        host: this.defaultConfig.host
      };
    }
  }
}
