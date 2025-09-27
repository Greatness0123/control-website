import { adminDb } from '../firebase/admin';

// Flutterwave API URL
const FLW_API_URL = 'https://api.flutterwave.com/v3';

// Interface for Flutterwave payment request
interface FlutterwavePaymentRequest {
  amount: number;
  currency: string;
  tx_ref: string;
  redirect_url: string;
  customer: {
    email: string;
    name?: string;
    phone_number?: string;
  };
  meta?: {
    userId: string;
    plan?: string;
    tokenPack?: string;
    [key: string]: any;
  };
  customizations?: {
    title: string;
    logo: string;
    description: string;
  };
}

// Interface for Flutterwave payment response
export interface FlutterwavePaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

// Interface for Flutterwave webhook payload
interface FlutterwaveWebhookPayload {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    payment_type: string;
    created_at: string;
    customer: {
      id: number;
      email: string;
      name: string;
      phone_number: string;
    };
    meta?: {
      userId: string;
      plan?: string;
      tokenPack?: string;
      [key: string]: any;
    };
  };
}

/**
 * Initialize a payment with Flutterwave
 * @param paymentData - The payment data
 * @returns The payment link
 */
export async function initializePayment(
  paymentData: FlutterwavePaymentRequest
): Promise<string> {
  try {
    const response = await fetch(`${FLW_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
      body: JSON.stringify({
        ...paymentData,
        customizations: {
          title: 'Control Desktop',
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
          description: paymentData.meta?.plan 
            ? `Subscription to ${paymentData.meta.plan} plan` 
            : paymentData.meta?.tokenPack 
              ? `Purchase of ${paymentData.meta.tokenPack} token pack` 
              : 'Payment for Control Desktop',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Flutterwave error: ${errorData.message}`);
    }

    const data = await response.json() as FlutterwavePaymentResponse;
    return data.data.link;
  } catch (error) {
    console.error('Error initializing Flutterwave payment:', error);
    throw error;
  }
}

/**
 * Verify a Flutterwave transaction
 * @param transactionId - The transaction ID
 * @returns The transaction details
 */
export async function verifyTransaction(transactionId: string): Promise<any> {
  try {
    const response = await fetch(`${FLW_API_URL}/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Flutterwave verification error: ${errorData.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying Flutterwave transaction:', error);
    throw error;
  }
}

/**
 * Process a Flutterwave webhook payload
 * @param payload - The webhook payload
 * @returns True if the webhook was processed successfully
 */
export async function processWebhook(payload: FlutterwaveWebhookPayload): Promise<boolean> {
  try {
    // Verify the webhook signature
    // In production, you should verify the webhook signature using the FLW_WEBHOOK_SECRET

    // Only process successful payments
    if (payload.event !== 'charge.completed' || payload.data.status !== 'successful') {
      return false;
    }

    // Get the user ID from the metadata
    const userId = payload.data.meta?.userId;
    if (!userId) {
      console.error('No user ID found in webhook payload');
      return false;
    }

    // Create a transaction record in Firestore
    await adminDb.collection('transactions').add({
      provider: 'flutterwave',
      provider_id: payload.data.id.toString(),
      amount: payload.data.amount,
      currency: payload.data.currency,
      status: payload.data.status,
      userId,
      metadata: payload.data.meta || {},
      createdAt: new Date(),
    });

    // Update the user's subscription or token balance based on the payment type
    const userRef = adminDb.collection('users').doc(userId);
    const user = await userRef.get();

    if (!user.exists) {
      console.error(`User ${userId} not found`);
      return false;
    }

    // Handle subscription payment
    if (payload.data.meta?.plan) {
      await userRef.update({
        plan: payload.data.meta.plan,
        subscriptionStatus: 'active',
        lastPayment: new Date(),
      });
    }

    // Handle token pack purchase
    if (payload.data.meta?.tokenPack) {
      // Get the token amount from the token pack name
      // This is a simplified example - in production, you would have a mapping of token pack names to token amounts
      const tokenAmount = parseInt(payload.data.meta.tokenPack.split(' ')[0].replace(/[^0-9]/g, ''));
      
      if (isNaN(tokenAmount)) {
        console.error(`Invalid token pack: ${payload.data.meta.tokenPack}`);
        return false;
      }

      // Update the user's token balance
      await userRef.update({
        token_balance: (user.data()?.token_balance || 0) + tokenAmount,
        lastPayment: new Date(),
      });
    }

    return true;
  } catch (error) {
    console.error('Error processing Flutterwave webhook:', error);
    return false;
  }
}