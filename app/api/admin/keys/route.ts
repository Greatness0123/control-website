import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminMiddleware } from '@/lib/auth/utils';
import { adminDb } from '@/lib/firebase/admin';
import { createApiKey, revokeApiKey } from '@/lib/api/keys';

// Schema for creating a new API key
const createKeySchema = z.object({
  userId: z.string().min(1),
  tier: z.enum(['free', 'pro', 'payg']),
  quota: z.number().optional(),
});

// Schema for revoking an API key
const revokeKeySchema = z.object({
  key: z.string().min(1),
});

/**
 * GET handler for the /api/admin/keys endpoint
 * Returns all API keys
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Check if the user is an admin
  const adminResponse = await adminMiddleware(req);
  if (adminResponse) {
    return adminResponse;
  }
  
  try {
    // Get all API keys from Firestore
    const keysSnapshot = await adminDb.collection('api_keys').get();
    const keys = keysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json(keys);
  } catch (error: any) {
    console.error('Error getting API keys:', error);
    
    return NextResponse.json(
      { error: 'Failed to get API keys', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for the /api/admin/keys endpoint
 * Creates a new API key
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
    const result = createKeySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { userId, tier, quota } = result.data;
    
    // Check if the user exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create the API key
    const apiKey = await createApiKey(userId, tier, quota || 0);
    
    return NextResponse.json(apiKey);
  } catch (error: any) {
    console.error('Error creating API key:', error);
    
    return NextResponse.json(
      { error: 'Failed to create API key', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for the /api/admin/keys endpoint
 * Revokes an API key
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  // Check if the user is an admin
  const adminResponse = await adminMiddleware(req);
  if (adminResponse) {
    return adminResponse;
  }
  
  try {
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const result = revokeKeySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { key } = result.data;
    
    // Revoke the API key
    const success = await revokeApiKey(key);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to revoke API key' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error revoking API key:', error);
    
    return NextResponse.json(
      { error: 'Failed to revoke API key', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}