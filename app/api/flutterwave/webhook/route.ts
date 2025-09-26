import { NextRequest, NextResponse } from 'next/server';
import { processWebhook } from '@/lib/flutterwave/client';

/**
 * POST handler for the /api/flutterwave/webhook endpoint
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify the webhook signature
    const verifHash = req.headers.get('verif-hash');
    if (!verifHash || verifHash !== process.env.FLW_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid webhook signature' },
        { status: 401 }
      );
    }
    
    // Parse the webhook payload
    const payload = await req.json();
    
    // Process the webhook
    const success = await processWebhook(payload);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 400 }
      );
    }
    
    // Return success
    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Error processing Flutterwave webhook:', error);
    
    return NextResponse.json(
      { error: 'Failed to process webhook', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}