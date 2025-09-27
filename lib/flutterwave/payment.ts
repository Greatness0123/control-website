import { FlutterwavePaymentResponse } from './client';

// Flutterwave API URL
const FLW_API_URL = 'https://api.flutterwave.com/v3';

/**
 * Create a payment link with Flutterwave
 * @param paymentData - The payment data
 * @returns The payment link
 */
export async function createPaymentLink(paymentData: {
  amount: number;
  currency: string;
  tx_ref: string;
  customer: {
    email: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  meta?: Record<string, any>;
}): Promise<string> {
  try {
    // Create a standard payment link
    const response = await fetch(`${FLW_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
      body: JSON.stringify({
        ...paymentData,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Flutterwave error: ${errorData.message}`);
    }

    const data = await response.json() as FlutterwavePaymentResponse;
    return data.data.link;
  } catch (error) {
    console.error('Error creating Flutterwave payment link:', error);
    throw error;
  }
}