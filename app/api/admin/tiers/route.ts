import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';

// Dynamic imports to prevent build issues
async function getAdminMiddleware() {
  const { adminMiddleware } = await import('@/lib/auth/utils');
  return adminMiddleware;
}

async function getRedisClient() {
  try {
    const redis = await import('@/lib/redis/client');
    return redis.default;
  } catch (error) {
    console.warn('Redis not available:', error);
    return null;
  }
}

// Schema for creating or updating a tier
const tierSchema = z.object({
  name: z.string().min(1),
  default_model: z.string().min(1),
  rate_limit_per_min: z.number().int().positive(),
  monthly_quota: z.number().int().nonnegative(),
  price_per_token: z.number().nonnegative(),
  display_name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  features: z.array(z.string()).optional(),
});

// Interface for tier data
interface TierData {
  id: string;
  name?: string;
  default_model?: string;
  rate_limit_per_min?: number;
  monthly_quota?: number;
  price_per_token?: number;
  display_name?: string;
  description?: string;
  price?: number;
  features?: string[];
}

/**
 * GET handler for the /api/admin/tiers endpoint
 * Returns all tiers
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Check if the user is an admin
    const adminMiddleware = await getAdminMiddleware();
    const adminResponse = await adminMiddleware(req);
    if (adminResponse) {
      return adminResponse;
    }
    
    // Get all tiers from Firestore
    const tiersSnapshot = await adminDb.collection('tiers').get();
    const tiers: TierData[] = tiersSnapshot.docs.map(doc => {
      const tierData = doc.data() as Omit<TierData, 'id'>;
      return {
        id: doc.id,
        ...tierData
      };
    });
    
    return NextResponse.json(tiers);
  } catch (error: any) {
    console.error('Error getting tiers:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get tiers', 
        message: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for the /api/admin/tiers endpoint
 * Creates or updates a tier
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Check if the user is an admin
    const adminMiddleware = await getAdminMiddleware();
    const adminResponse = await adminMiddleware(req);
    if (adminResponse) {
      return adminResponse;
    }
    
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const result = tierSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { name, ...tierData } = result.data;
    
    // Create or update the tier in Firestore
    await adminDb.collection('tiers').doc(name).set(tierData, { merge: true });
    
    // Update the tier in Redis (if available)
    const redis = await getRedisClient();
    if (redis) {
      try {
        await redis.set(`tier:${name}`, JSON.stringify(tierData), { ex: 3600 });
      } catch (redisError) {
        console.warn('Redis write error:', redisError);
        // Continue without Redis
      }
    }
    
    return NextResponse.json({ id: name, ...tierData });
  } catch (error: any) {
    console.error('Error creating/updating tier:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create/update tier', 
        message: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for the /api/admin/tiers endpoint
 * Deletes a tier
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Check if the user is an admin
    const adminMiddleware = await getAdminMiddleware();
    const adminResponse = await adminMiddleware(req);
    if (adminResponse) {
      return adminResponse;
    }
    
    // Get the tier name from the query parameters
    const url = new URL(req.url);
    const name = url.searchParams.get('name');
    
    if (!name) {
      return NextResponse.json(
        { error: 'Missing tier name' },
        { status: 400 }
      );
    }
    
    // Delete the tier from Firestore
    await adminDb.collection('tiers').doc(name).delete();
    
    // Delete the tier from Redis (if available)
    const redis = await getRedisClient();
    if (redis) {
      try {
        await redis.del(`tier:${name}`);
      } catch (redisError) {
        console.warn('Redis delete error:', redisError);
        // Continue without Redis
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting tier:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete tier', 
        message: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}