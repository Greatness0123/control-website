import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminMiddleware } from '@/lib/auth/utils';
import { adminDb } from '@/lib/firebase/admin';
import redis from '@/lib/redis/client';

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

/**
 * GET handler for the /api/admin/tiers endpoint
 * Returns all tiers
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Check if the user is an admin
  const adminResponse = await adminMiddleware(req);
  if (adminResponse) {
    return adminResponse;
  }
  
  try {
    // Get all tiers from Firestore
    const tiersSnapshot = await adminDb.collection('tiers').get();
    const tiers = tiersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json(tiers);
  } catch (error: any) {
    console.error('Error getting tiers:', error);
    
    return NextResponse.json(
      { error: 'Failed to get tiers', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for the /api/admin/tiers endpoint
 * Creates or updates a tier
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Check if the user is an admin
  const adminResponse = await adminMiddleware(req);
  if (adminResponse) {
    return adminResponse;
  }
  
  try {
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
    
    // Update the tier in Redis
    await redis.set(`tier:${name}`, JSON.stringify(tierData), { ex: 3600 });
    
    return NextResponse.json({ id: name, ...tierData });
  } catch (error: any) {
    console.error('Error creating/updating tier:', error);
    
    return NextResponse.json(
      { error: 'Failed to create/update tier', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for the /api/admin/tiers endpoint
 * Deletes a tier
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  // Check if the user is an admin
  const adminResponse = await adminMiddleware(req);
  if (adminResponse) {
    return adminResponse;
  }
  
  try {
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
    
    // Delete the tier from Redis
    await redis.del(`tier:${name}`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting tier:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete tier', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}