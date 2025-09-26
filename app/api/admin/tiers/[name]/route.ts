import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import redis from '@/lib/redis/client';

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
    
    // Try to get the tier from Redis first
    const cachedTier = await redis.get(`tier:${name}`);
    if (cachedTier) {
      return NextResponse.json(JSON.parse(cachedTier as string));
    }
    
    // If not in Redis, get from Firestore
    const tierDoc = await adminDb.collection('tiers').doc(name).get();
    
    if (!tierDoc.exists) {
      return NextResponse.json(
        { error: 'Tier not found' },
        { status: 404 }
      );
    }
    
    const tierData = tierDoc.data();
    
    // Cache in Redis for 1 hour
    await redis.set(`tier:${name}`, JSON.stringify(tierData), { ex: 3600 });
    
    return NextResponse.json(tierData);
  } catch (error: any) {
    console.error(`Error getting tier ${params.name}:`, error);
    
    return NextResponse.json(
      { error: 'Failed to get tier', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}