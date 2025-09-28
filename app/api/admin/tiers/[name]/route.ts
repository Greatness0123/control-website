import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Dynamic import to prevent build issues
async function getRedisClient() {
  try {
    const redis = await import('@/lib/redis/client');
    return redis.default;
  } catch (error) {
    console.warn('Redis client not available:', error);
    return null;
  }
}

/**
 * GET handler for the /api/admin/tiers/[name] endpoint
 * Returns a specific tier
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
): Promise<NextResponse> {
  try {
    const { name } = params;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Tier name is required' },
        { status: 400 }
      );
    }

    // Get Redis client dynamically
    const redis = await getRedisClient();
    
    // Try to get the tier from Redis first (if available)
    if (redis) {
      try {
        const cachedTier = await redis.get(`tier:${name}`);
        if (cachedTier) {
          return NextResponse.json(JSON.parse(cachedTier as string));
        }
      } catch (redisError) {
        console.warn('Redis get error:', redisError);
        // Continue without Redis
      }
    }
    
    // If not in Redis or Redis unavailable, get from Firestore
    const tierDoc = await adminDb.collection('tiers').doc(name).get();
    
    if (!tierDoc.exists) {
      return NextResponse.json(
        { error: 'Tier not found' },
        { status: 404 }
      );
    }
    
    const tierData = tierDoc.data();
    
    // Cache in Redis for 1 hour (if Redis is available)
    if (redis && tierData) {
      try {
        await redis.set(`tier:${name}`, JSON.stringify(tierData), { ex: 3600 });
      } catch (redisError) {
        console.warn('Redis set error:', redisError);
        // Continue without caching - not critical
      }
    }
    
    return NextResponse.json(tierData);
  } catch (error: any) {
    console.error(`Error getting tier ${params?.name || 'unknown'}:`, error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get tier', 
        message: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating a tier
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { name: string } }
): Promise<NextResponse> {
  try {
    const { name } = params;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Tier name is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    // Update in Firestore
    await adminDb.collection('tiers').doc(name).set(body, { merge: true });
    
    // Invalidate Redis cache
    const redis = await getRedisClient();
    if (redis) {
      try {
        await redis.del(`tier:${name}`);
      } catch (redisError) {
        console.warn('Redis delete error:', redisError);
      }
    }
    
    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    console.error(`Error updating tier ${params?.name || 'unknown'}:`, error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update tier', 
        message: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a tier
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { name: string } }
): Promise<NextResponse> {
  try {
    const { name } = params;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Tier name is required' },
        { status: 400 }
      );
    }

    // Delete from Firestore
    await adminDb.collection('tiers').doc(name).delete();
    
    // Remove from Redis cache
    const redis = await getRedisClient();
    if (redis) {
      try {
        await redis.del(`tier:${name}`);
      } catch (redisError) {
        console.warn('Redis delete error:', redisError);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting tier ${params?.name || 'unknown'}:`, error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete tier', 
        message: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}