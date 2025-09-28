import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';

// Dynamic imports to prevent build issues
async function getAdminMiddleware() {
  const { adminMiddleware } = await import('@/lib/auth/utils');
  return adminMiddleware;
}

async function getRedisClient() {
  const redis = await import('@/lib/redis/client');
  return redis;
}

// Schema for creating or updating an OpenRouter key
const openRouterKeySchema = z.object({
  id: z.string().min(1),
  env_name: z.string().min(1),
  notes: z.string().optional(),
});

// Interface for OpenRouter key data
interface OpenRouterKeyData {
  id: string;
  env_name: string;
  notes?: string;
  status?: string;
  last_checked?: any;
  current_status?: string;
}

/**
 * GET handler for the /api/admin/openrouter endpoint
 * Returns all OpenRouter keys
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Check if the user is an admin
    const adminMiddleware = await getAdminMiddleware();
    const adminResponse = await adminMiddleware(req);
    if (adminResponse) {
      return adminResponse;
    }
    
    // Get Redis client
    const { default: redis, REDIS_KEYS, OpenRouterStatus } = await getRedisClient();
    
    // Get all OpenRouter keys from Firestore
    const keysSnapshot = await adminDb.collection('openrouter_keys').get();
    const keys: OpenRouterKeyData[] = keysSnapshot.docs.map(doc => {
      const keyData = doc.data() as Omit<OpenRouterKeyData, 'id'>;
      return {
        id: doc.id,
        ...keyData
      };
    });
    
    // Get the status of each key from Redis
    const keysWithStatus = await Promise.all(
      keys.map(async (key) => {
        try {
          const status = await redis.get(`${REDIS_KEYS.OPENROUTER_STATUS}${key.id}`);
          return {
            ...key,
            current_status: status || OpenRouterStatus.HEALTHY,
          };
        } catch (redisError) {
          console.warn('Redis error for key', key.id, redisError);
          return {
            ...key,
            current_status: OpenRouterStatus.HEALTHY,
          };
        }
      })
    );
    
    return NextResponse.json(keysWithStatus);
  } catch (error: any) {
    console.error('Error getting OpenRouter keys:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get OpenRouter keys', 
        message: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for the /api/admin/openrouter endpoint
 * Creates or updates an OpenRouter key
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Check if the user is an admin
    const adminMiddleware = await getAdminMiddleware();
    const adminResponse = await adminMiddleware(req);
    if (adminResponse) {
      return adminResponse;
    }
    
    // Get Redis client
    const { default: redis, REDIS_KEYS, OpenRouterStatus } = await getRedisClient();
    
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const result = openRouterKeySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { id, env_name, notes } = result.data;
    
    // Create or update the OpenRouter key in Firestore
    const keyData = {
      env_name,
      notes: notes || '',
      status: OpenRouterStatus.HEALTHY,
      last_checked: new Date(),
    };
    
    await adminDb.collection('openrouter_keys').doc(id).set(keyData, { merge: true });
    
    // Set the key as healthy in Redis
    try {
      await redis.set(
        `${REDIS_KEYS.OPENROUTER_STATUS}${id}`,
        OpenRouterStatus.HEALTHY
      );
    } catch (redisError) {
      console.warn('Redis error setting key status:', redisError);
      // Continue without Redis - it's not critical for creation
    }
    
    return NextResponse.json({
      id,
      ...keyData,
    });
  } catch (error: any) {
    console.error('Error creating/updating OpenRouter key:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create/update OpenRouter key', 
        message: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for the /api/admin/openrouter endpoint
 * Deletes an OpenRouter key
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Check if the user is an admin
    const adminMiddleware = await getAdminMiddleware();
    const adminResponse = await adminMiddleware(req);
    if (adminResponse) {
      return adminResponse;
    }
    
    // Get Redis client
    const { default: redis, REDIS_KEYS } = await getRedisClient();
    
    // Get the key ID from the query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing key ID' },
        { status: 400 }
      );
    }
    
    // Delete the OpenRouter key from Firestore
    await adminDb.collection('openrouter_keys').doc(id).delete();
    
    // Delete the key from Redis
    try {
      await redis.del(`${REDIS_KEYS.OPENROUTER_STATUS}${id}`);
    } catch (redisError) {
      console.warn('Redis error deleting key:', redisError);
      // Continue without Redis - Firestore deletion is more important
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting OpenRouter key:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete OpenRouter key', 
        message: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}