import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth/utils';
import { initializePayment } from '@/lib/flutterwave/client';

// Schema for the request body
const requestSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  plan: z.string().optional(),
  tokenPack: z.string().optional(),
  payg: z.boolean().optional(),
});

/**
 * POST handler for the /api/flutterwave/create-payment endpoint
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get the current user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const result = requestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { amount, currency, plan, tokenPack, payg } = result.data;
    
    // Generate a unique transaction reference
    const txRef = `ctrl-${uuidv4()}`;
    
    // Create the payment metadata
    const metadata = {
      userId: user.uid,
    };
    
    if (plan) {
      metadata.plan = plan;
    }
    
    if (tokenPack) {
      metadata.tokenPack = tokenPack;
    }
    
    if (payg) {
      metadata.payg = true;
    }
    
    // Initialize the payment
    const paymentLink = await initializePayment({
      amount,
      currency,
      tx_ref: txRef,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success`,
      customer: {
        email: user.email,
        name: user.displayName || user.email,
      },
      meta: metadata,
    });
    
    // Return the payment link
    return NextResponse.json({ payment_link: paymentLink, tx_ref: txRef });
  } catch (error: any) {
    console.error('Error creating Flutterwave payment:', error);
    
    return NextResponse.json(
      { error: 'Failed to create payment', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}