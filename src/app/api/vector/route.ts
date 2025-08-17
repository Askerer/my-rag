import { NextRequest, NextResponse } from 'next/server';
import { VectorDBFactory, VectorDBManager } from '../../../lib/vector-db/VectorDBFactory';
import { VectorDBConfig } from '../../../lib/vector-db/types';

// 預設向量資料庫配置（生產環境應從環境變數讀取）
const getDefaultConfig = (): VectorDBConfig => {
  return {
    type: (process.env.VECTOR_DB_TYPE as any) || 'milvus',
    host: process.env.VECTOR_DB_HOST || 'localhost',
    port: parseInt(process.env.VECTOR_DB_PORT || '19530'),
    username: process.env.VECTOR_DB_USERNAME,
    password: process.env.VECTOR_DB_PASSWORD,
    database: process.env.VECTOR_DB_DATABASE || 'default',
    apiKey: process.env.VECTOR_DB_API_KEY,
  };
};

// 全域向量資料庫管理器
let vectorDBManager: VectorDBManager | null = null;

// 獲取或創建向量資料庫管理器
async function getVectorDBManager(): Promise<VectorDBManager> {
  if (!vectorDBManager) {
    const config = getDefaultConfig();
    vectorDBManager = new VectorDBManager(config);
    await vectorDBManager.initialize();
  }
  
  if (!vectorDBManager.isConnected()) {
    await vectorDBManager.initialize();
  }
  
  return vectorDBManager;
}

/**
 * GET /api/vector
 * 獲取向量資料庫狀態和支援的操作
 */
export async function GET(request: NextRequest) {
  try {
    const manager = await getVectorDBManager();
    const healthStatus = await manager.healthCheck();
    
    return NextResponse.json({
      success: true,
      data: {
        status: healthStatus,
        supportedTypes: VectorDBFactory.getSupportedTypes(),
        config: {
          type: manager.getConfig().type,
          host: manager.getConfig().host,
          // 不返回敏感資訊
        }
      }
    });
  } catch (error) {
    console.error('Vector DB status check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vector
 * 執行向量操作（插入、搜尋等）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, collection, data, params } = body;

    if (!operation) {
      return NextResponse.json(
        { success: false, error: 'Operation is required' },
        { status: 400 }
      );
    }

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const manager = await getVectorDBManager();
    const vectorDB = manager.getInstance();

    let result;

    switch (operation) {
      case 'createCollection':
        if (!data || !data.dimension) {
          return NextResponse.json(
            { success: false, error: 'Collection dimension is required' },
            { status: 400 }
          );
        }
        
        await vectorDB.createCollection({
          name: collection,
          dimension: data.dimension,
          indexType: data.indexType,
          metricType: data.metricType,
          description: data.description
        });
        
        result = { message: `Collection '${collection}' created successfully` };
        break;

      case 'dropCollection':
        await vectorDB.dropCollection(collection);
        result = { message: `Collection '${collection}' dropped successfully` };
        break;

      case 'hasCollection':
        const exists = await vectorDB.hasCollection(collection);
        result = { exists };
        break;

      case 'listCollections':
        const collections = await vectorDB.listCollections();
        result = { collections };
        break;

      case 'getStats':
        const stats = await vectorDB.getCollectionStats(collection);
        result = { stats };
        break;

      case 'insert':
        if (!data || !Array.isArray(data.vectors)) {
          return NextResponse.json(
            { success: false, error: 'Vectors array is required' },
            { status: 400 }
          );
        }
        
        const insertResult = await vectorDB.insert(collection, data.vectors);
        result = insertResult;
        break;

      case 'update':
        if (!data || !Array.isArray(data.vectors)) {
          return NextResponse.json(
            { success: false, error: 'Vectors array is required' },
            { status: 400 }
          );
        }
        
        const updateResult = await vectorDB.update(collection, data.vectors);
        result = updateResult;
        break;

      case 'delete':
        if (!data || !Array.isArray(data.ids)) {
          return NextResponse.json(
            { success: false, error: 'IDs array is required' },
            { status: 400 }
          );
        }
        
        const deleteResult = await vectorDB.delete(collection, data.ids);
        result = deleteResult;
        break;

      case 'search':
        if (!data || !Array.isArray(data.vector)) {
          return NextResponse.json(
            { success: false, error: 'Search vector is required' },
            { status: 400 }
          );
        }
        
        const searchParams = {
          vector: data.vector,
          topK: data.topK || 10,
          filter: data.filter,
          threshold: data.threshold
        };
        
        const searchResults = await vectorDB.search(collection, searchParams);
        result = { results: searchResults };
        break;

      case 'createIndex':
        await vectorDB.createIndex(collection, params);
        result = { message: `Index created for collection '${collection}'` };
        break;

      case 'dropIndex':
        await vectorDB.dropIndex(collection);
        result = { message: `Index dropped for collection '${collection}'` };
        break;

      case 'flush':
        await vectorDB.flush(collection);
        result = { message: `Collection '${collection}' flushed` };
        break;

      case 'compact':
        await vectorDB.compact(collection);
        result = { message: `Collection '${collection}' compacted` };
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported operation: ${operation}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Vector operation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/vector
 * 更新向量資料庫配置
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Configuration is required' },
        { status: 400 }
      );
    }

    // 驗證配置
    VectorDBFactory.validateConfig(config);

    // 關閉現有連接
    if (vectorDBManager) {
      await vectorDBManager.close();
      vectorDBManager = null;
    }

    // 創建新的管理器
    vectorDBManager = new VectorDBManager(config);
    await vectorDBManager.initialize();

    const healthStatus = await vectorDBManager.healthCheck();

    return NextResponse.json({
      success: true,
      data: {
        message: 'Vector database configuration updated successfully',
        status: healthStatus
      }
    });

  } catch (error) {
    console.error('Vector DB configuration update failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vector
 * 關閉向量資料庫連接
 */
export async function DELETE(request: NextRequest) {
  try {
    if (vectorDBManager) {
      await vectorDBManager.close();
      vectorDBManager = null;
    }

    // 關閉所有工廠實例
    await VectorDBFactory.disconnectAll();

    return NextResponse.json({
      success: true,
      data: { message: 'All vector database connections closed' }
    });

  } catch (error) {
    console.error('Vector DB disconnection failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
