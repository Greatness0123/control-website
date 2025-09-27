import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import redis, { REDIS_KEYS } from '../redis/client';

/**
 * Interface for API key data
 */
export interface ApiKeyData {
  key: string;
  tier: 'free' | 'pro' | 'payg';
  status: 'active' | 'revoked';
  owner_uid: string;
  monthly_quota: number;
  usage_this_month: number;
  linked_openrouter_keys: string[];
  created_at: Date;
}

/**
 * Generate a new API key
 * @returns A new API key in the format 'ctrl-xxxxxxxxxxxxxxxx'
 */
export function generateApiKey(): string {
  // Generate a random UUID and take the first 16 characters
  const randomPart = uuidv4().replace(/-/g, '').substring(0, 16);
  return `ctrl-${randomPart}`;
}

/**
 * Validate an API key format
 * @param apiKey - The API key to validate
 * @returns True if the API key format is valid
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  return /^ctrl-[A-Za-z0-9]{16}$/.test(apiKey);
}

/**
 * Create a new API key in Firestore
 * @param userId - The user ID who owns the key
 * @param tier - The tier for the key
 * @param quota - The monthly quota for the key
 * @returns The created API key data
 */
export async function createApiKey(
  userId: string,
  tier: 'free' | 'pro' | 'payg',
  quota: number
): Promise<ApiKeyData> {
  // Generate a new API key
  const key = generateApiKey();
  
  // Get the tier details
  const tierDoc = await adminDb.collection('tiers').doc(tier).get();
  if (!tierDoc.exists) {
    throw new Error(`Tier ${tier} not found`);
  }
  
  // Create the API key data
  const apiKeyData: ApiKeyData = {
    key,
    tier,
    status: 'active',
    owner_uid: userId,
    monthly_quota: quota || tierDoc.data()?.monthly_quota || 0,
    usage_this_month: 0,
    linked_openrouter_keys: [],
    created_at: new Date(),
  };
  
  // Save the API key to Firestore
  await adminDb.collection('api_keys').doc(key).set(apiKeyData);
  
  return apiKeyData;
}

/**
 * Get an API key from Firestore
 * @param apiKey - The API key to get
 * @returns The API key data or null if not found
 */
export async function getApiKey(apiKey: string): Promise<ApiKeyData | null> {
  // Validate the API key format
  if (!validateApiKeyFormat(apiKey)) {
    return null;
  }
  
  // Get the API key from Firestore
  const apiKeyDoc = await adminDb.collection('api_keys').doc(apiKey).get();
  if (!apiKeyDoc.exists) {
    return null;
  }
  
  return apiKeyDoc.data() as ApiKeyData;
}

/**
 * Revoke an API key
 * @param apiKey - The API key to revoke
 * @returns True if the key was revoked
 */
export async function revokeApiKey(apiKey: string): Promise<boolean> {
  // Validate the API key format
  if (!validateApiKeyFormat(apiKey)) {
    return false;
  }
  
  // Update the API key status in Firestore
  await adminDb.collection('api_keys').doc(apiKey).update({
    status: 'revoked',
  });
  
  // Clear any quota in Redis
  await redis.del(`${REDIS_KEYS.QUOTA}${apiKey}`);
  
  return true;
}

/**
 * Check if an API key has exceeded its quota
 * @param apiKey - The API key to check
 * @returns True if the key has exceeded its quota
 */
export async function hasExceededQuota(apiKey: string): Promise<boolean> {
  // Get the API key data
  const apiKeyData = await getApiKey(apiKey);
  if (!apiKeyData) {
    return true;
  }
  
  // Pay-as-you-go keys don't have a quota
  if (apiKeyData.tier === 'payg') {
    return false;
  }
  
  // Check if the key has exceeded its quota
  return apiKeyData.usage_this_month >= apiKeyData.monthly_quota;
}

/**
 * Update API key usage
 * @param apiKey - The API key
 * @param tokensUsed - The number of tokens used
 */
export async function updateApiKeyUsage(apiKey: string, tokensUsed: number): Promise<void> {
  // Update the API key usage in Firestore
  await adminDb.collection('api_keys').doc(apiKey).update({
    usage_this_month: FieldValue.increment(tokensUsed),
  });
  
  // Get the API key data to update the user's usage
  const apiKeyData = await getApiKey(apiKey);
  if (!apiKeyData) {
    return;
  }
  
  // Update the user's usage
  await adminDb.collection('users').doc(apiKeyData.owner_uid).update({
    usage: FieldValue.increment(tokensUsed),
  });
  
  // If the key is pay-as-you-go, update the user's due amount
  if (apiKeyData.tier === 'payg') {
    // Get the tier details to calculate the cost
    const tierDoc = await adminDb.collection('tiers').doc('payg').get();
    if (!tierDoc.exists) {
      return;
    }
    
    const pricePerToken = tierDoc.data()?.price_per_token || 0;
    const cost = tokensUsed * pricePerToken;
    
    // Update the user's pay-as-you-go due amount
    await adminDb.collection('users').doc(apiKeyData.owner_uid).update({
      payg_due: FieldValue.increment(cost),
    });
  }
}

/**
 * Log API key usage
 * @param apiKey - The API key
 * @param userId - The user ID
 * @param endpoint - The API endpoint
 * @param tokensUsed - The number of tokens used
 * @param success - Whether the request was successful
 * @param errorCode - The error code if the request failed
 * @param openrouterKeyUsed - The OpenRouter key used
 */
export async function logApiKeyUsage(
  apiKey: string,
  userId: string,
  endpoint: string,
  tokensUsed: number,
  success: boolean,
  errorCode?: string,
  openrouterKeyUsed?: string
): Promise<void> {
  // Create a usage log entry
  await adminDb.collection('usage_logs').add({
    api_key: apiKey,
    uid: userId,
    timestamp: new Date(),
    endpoint,
    tokens_used: tokensUsed,
    success,
    error_code: errorCode,
    openrouter_key_used: openrouterKeyUsed,
  });
}