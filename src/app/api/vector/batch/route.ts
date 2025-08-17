import { NextRequest, NextResponse } from 'next/server';
import { VectorDBManager } from '../../../../lib/vector-db/VectorDBFactory';
import { VectorDBConfig, Vector } from '../../../../lib/vector-db/types';

// 批量操作配置
const BATCH_SIZE = 100;
const MAX_BATCH_SIZE = 1000;

// 獲取向量資料庫管理器
async function getVectorDBManager(): Promise<VectorDBManager> {
  const config: VectorDBConfig = {
    type: (process.env.VECTOR_DB_TYPE as any) || 'milvus',
    host: process.env.VECTOR_DB_HOST || 'localhost',
    port: parseInt(process.env.VECTOR_DB_PORT || '19530'),
    username: process.env.VECTOR_DB_USERNAME,
    password: process.env.VECTOR_DB_PASSWORD,
    database: process.env.VECTOR_DB_DATABASE || 'default',
    apiKey: process.env.VECTOR_DB_API_KEY,
  };

  const manager = new VectorDBManager(config);
  await manager.initialize();
  return manager;
}

/**
 * POST /api/vector/batch
 * 批量向量操作
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, collection, data, options } = body;

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
      case 'batchInsert':
        result = await handleBatchInsert(vectorDB, collection, data, options);
        break;

      case 'batchUpdate':
        result = await handleBatchUpdate(vectorDB, collection, data, options);
        break;

      case 'batchDelete':
        result = await handleBatchDelete(vectorDB, collection, data, options);
        break;

      case 'batchSearch':
        result = await handleBatchSearch(vectorDB, collection, data, options);
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported batch operation: ${operation}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Batch vector operation failed:', error);
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
 * 批量插入向量
 */
async function handleBatchInsert(
  vectorDB: any, 
  collection: string, 
  data: any, 
  options: any = {}
) {
  if (!data || !Array.isArray(data.vectors)) {
    throw new Error('Vectors array is required for batch insert');
  }

  const vectors: Vector[] = data.vectors;
  const batchSize = Math.min(options.batchSize || BATCH_SIZE, MAX_BATCH_SIZE);

  if (vectors.length > MAX_BATCH_SIZE && !options.allowLargeBatch) {
    throw new Error(`Batch size too large. Maximum allowed: ${MAX_BATCH_SIZE}`);
  }

  const results = [];
  const errors = [];
  let totalInserted = 0;

  // 分批處理
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    
    try {
      const batchResult = await vectorDB.insert(collection, batch);
      results.push({
        batchIndex: Math.floor(i / batchSize),
        startIndex: i,
        endIndex: i + batch.length - 1,
        result: batchResult
      });
      
      if (batchResult.success) {
        totalInserted += batchResult.insertedCount || 0;
      } else {
        errors.push(...(batchResult.errors || []));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Batch ${Math.floor(i / batchSize)}: ${errorMsg}`);
    }

    // 可選的批次間延遲
    if (options.delay && i + batchSize < vectors.length) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
  }

  return {
    totalVectors: vectors.length,
    totalInserted,
    batchCount: Math.ceil(vectors.length / batchSize),
    batchSize,
    results,
    errors,
    success: errors.length === 0
  };
}

/**
 * 批量更新向量
 */
async function handleBatchUpdate(
  vectorDB: any, 
  collection: string, 
  data: any, 
  options: any = {}
) {
  if (!data || !Array.isArray(data.vectors)) {
    throw new Error('Vectors array is required for batch update');
  }

  const vectors: Vector[] = data.vectors;
  const batchSize = Math.min(options.batchSize || BATCH_SIZE, MAX_BATCH_SIZE);

  const results = [];
  const errors = [];
  let totalUpdated = 0;

  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    
    try {
      const batchResult = await vectorDB.update(collection, batch);
      results.push({
        batchIndex: Math.floor(i / batchSize),
        result: batchResult
      });
      
      if (batchResult.success) {
        totalUpdated += batchResult.insertedCount || 0;
      } else {
        errors.push(...(batchResult.errors || []));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Batch ${Math.floor(i / batchSize)}: ${errorMsg}`);
    }
  }

  return {
    totalVectors: vectors.length,
    totalUpdated,
    batchCount: Math.ceil(vectors.length / batchSize),
    results,
    errors,
    success: errors.length === 0
  };
}

/**
 * 批量刪除向量
 */
async function handleBatchDelete(
  vectorDB: any, 
  collection: string, 
  data: any, 
  options: any = {}
) {
  if (!data || !Array.isArray(data.ids)) {
    throw new Error('IDs array is required for batch delete');
  }

  const ids: string[] = data.ids;
  const batchSize = Math.min(options.batchSize || BATCH_SIZE, MAX_BATCH_SIZE);

  const results = [];
  const errors = [];
  let totalDeleted = 0;

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    
    try {
      const batchResult = await vectorDB.delete(collection, batch);
      results.push({
        batchIndex: Math.floor(i / batchSize),
        result: batchResult
      });
      
      if (batchResult.success) {
        totalDeleted += batchResult.insertedCount || 0;
      } else {
        errors.push(...(batchResult.errors || []));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Batch ${Math.floor(i / batchSize)}: ${errorMsg}`);
    }
  }

  return {
    totalIds: ids.length,
    totalDeleted,
    batchCount: Math.ceil(ids.length / batchSize),
    results,
    errors,
    success: errors.length === 0
  };
}

/**
 * 批量搜尋向量
 */
async function handleBatchSearch(
  vectorDB: any, 
  collection: string, 
  data: any, 
  options: any = {}
) {
  if (!data || !Array.isArray(data.queries)) {
    throw new Error('Queries array is required for batch search');
  }

  const queries = data.queries;
  const results = [];
  const errors = [];

  // 平行處理搜尋查詢（但限制併發數）
  const concurrency = options.concurrency || 5;
  const promises = [];

  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (query, index) => {
      try {
        const searchParams = {
          vector: query.vector,
          topK: query.topK || 10,
          filter: query.filter,
          threshold: query.threshold
        };
        
        const searchResults = await vectorDB.search(collection, searchParams);
        
        return {
          queryIndex: i + index,
          query: query,
          results: searchResults,
          success: true
        };
      } catch (error) {
        return {
          queryIndex: i + index,
          query: query,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        };
      }
    });

    promises.push(...batchPromises);
  }

  const allResults = await Promise.all(promises);

  // 整理結果
  allResults.forEach(result => {
    if (result.success) {
      results.push(result);
    } else {
      errors.push(`Query ${result.queryIndex}: ${result.error}`);
    }
  });

  return {
    totalQueries: queries.length,
    successfulQueries: results.length,
    failedQueries: errors.length,
    results,
    errors,
    success: errors.length === 0
  };
}

/**
 * GET /api/vector/batch
 * 獲取批量操作的配置和限制
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        supportedOperations: ['batchInsert', 'batchUpdate', 'batchDelete', 'batchSearch'],
        limits: {
          defaultBatchSize: BATCH_SIZE,
          maxBatchSize: MAX_BATCH_SIZE,
          maxConcurrency: 10
        },
        options: {
          batchSize: 'Number of items per batch (default: 100, max: 1000)',
          delay: 'Delay between batches in milliseconds',
          concurrency: 'Number of concurrent search queries (default: 5, max: 10)',
          allowLargeBatch: 'Allow batch sizes larger than default maximum'
        }
      }
    });
  } catch (error) {
    console.error('Failed to get batch operation info:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
