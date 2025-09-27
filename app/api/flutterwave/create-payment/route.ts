import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebase/admin';
import { db } from '@/lib/firebase/admin';
import { createPaymentLink } from '@/lib/flutterwave/payment';

// Define the request body interface
interface PaymentRequestBody {
  userId: string;
  plan?: string;
  tokenPack?: string;
  payg?: {
    amount: number;
    tokens: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json() as PaymentRequestBody;
    
    // Ensure the user ID in the token matches the user ID in the request
    if (decodedToken.uid !== body.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get user data
    const userDoc = await db.collection('users').doc(body.userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const userEmail = userData?.email || decodedToken.email;

    // Determine payment details based on the request type
    let amount = 0;
    let description = '';
    let metadata: Record<string, any> = { userId: body.userId };

    if (body.plan) {
      // Plan subscription payment
      switch (body.plan) {
        case 'pro':
          amount = 4999; // $49.99
          description = 'Control AI Pro Plan - Monthly Subscription';
          metadata.plan = 'pro';
          break;
        case 'enterprise':
          amount = 9999; // $99.99
          description = 'Control AI Enterprise Plan - Monthly Subscription';
          metadata.plan = 'enterprise';
          break;
        default:
          return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }
    } else if (body.tokenPack) {
      // Token pack purchase
      switch (body.tokenPack) {
        case 'starter':
          amount = 999; // $9.99
          description = 'Control AI Starter Token Pack - 100,000 tokens';
          metadata.tokenPack = 'starter';
          metadata.tokens = 100000;
          break;
        case 'pro':
          amount = 3999; // $39.99
          description = 'Control AI Pro Token Pack - 500,000 tokens';
          metadata.tokenPack = 'pro';
          metadata.tokens = 500000;
          break;
        case 'enterprise':
          amount = 14999; // $149.99
          description = 'Control AI Enterprise Token Pack - 2,000,000 tokens';
          metadata.tokenPack = 'enterprise';
          metadata.tokens = 2000000;
          break;
        default:
          return NextResponse.json({ error: 'Invalid token pack' }, { status: 400 });
      }
    } else if (body.payg) {
      // Pay-as-you-go payment
      if (!body.payg.amount || !body.payg.tokens || body.payg.amount <= 0 || body.payg.tokens <= 0) {
        return NextResponse.json({ error: 'Invalid PAYG parameters' }, { status: 400 });
      }
      
      amount = body.payg.amount;
      description = `Control AI Pay-as-you-go - ${body.payg.tokens.toLocaleString()} tokens`;
      metadata.payg = true;
      metadata.tokens = body.payg.tokens;
    } else {
      return NextResponse.json({ error: 'Missing payment type' }, { status: 400 });
    }

    // Create payment link with Flutterwave
    const paymentLink = await createPaymentLink({
      amount,
      currency: 'USD',
      tx_ref: `ctrl-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      customer: {
        email: userEmail,
        name: userData?.displayName || 'Control AI User'
      },
      customizations: {
        title: 'Control AI',
        description,
        logo: 'https://control-ai.com/logo.png'
      },
      meta: metadata
    });

    return NextResponse.json({ success: true, paymentLink });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}