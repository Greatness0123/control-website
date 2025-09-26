import redis, { REDIS_KEYS, REDIS_TTL } from '../redis/client';
import { getApiKey } from './keys';

/**
 * Interface for rate limit result
 */
interface RateLimitResult {
  limited: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
}

/**
 * Check if a request is rate limited
 * @param apiKey - The API key to check
 * @returns The rate limit result
 */
export async function checkRateLimit(apiKey: string): Promise<RateLimitResult> {
  try {
    // Get the API key data
    const apiKeyData = await getApiKey(apiKey);
    if (!apiKeyData) {
      return {
        limited: true,
        remaining: 0,
        limit: 0,
        resetAt: new Date(),
      };
    }

    // Get the tier details
    const tierDoc = await redis.get(`tier:${apiKeyData.tier}`);
    let tierData;
    
    if (!tierDoc) {
      // If not in Redis, get from Firestore and cache in Redis
      const tierSnapshot = await fetch(`/api/admin/tiers/${apiKeyData.tier}`);
      tierData = await tierSnapshot.json();
      
      // Cache in Redis for 1 hour
      await redis.set(`tier:${apiKeyData.tier}`, JSON.stringify(tierData), { ex: 3600 });
    } else {
      tierData = JSON.parse(tierDoc as string);
    }

    // Get the rate limit for this tier
    const rateLimit = tierData.rate_limit_per_min || 60; // Default to 60 requests per minute
    
    // Get the current rate limit count
    const rateLimitKey = `${REDIS_KEYS.QUOTA}${apiKey}:rate_limit`;
    const currentCount = await redis.get(rateLimitKey);
    
    // Get the TTL for the rate limit key
    const ttl = await redis.ttl(rateLimitKey);
    
    // If the key doesn't exist, create it
    if (!currentCount) {
      await redis.set(rateLimitKey, '1', { ex: 60 }); // 1 minute expiry
      
      return {
        limited: false,
        remaining: rateLimit - 1,
        limit: rateLimit,
        resetAt: new Date(Date.now() + 60000), // 1 minute from now
      };
    }
    
    // Check if the rate limit has been exceeded
    const count = parseInt(currentCount as string);
    if (count >= rateLimit) {
      return {
        limited: true,
        remaining: 0,
        limit: rateLimit,
        resetAt: new Date(Date.now() + (ttl * 1000)),
      };
    }
    
    // Increment the rate limit count
    await redis.incr(rateLimitKey);
    
    return {
      limited: false,
      remaining: rateLimit - count - 1,
      limit: rateLimit,
      resetAt: new Date(Date.now() + (ttl * 1000)),
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    
    // Default to not rate limited in case of error
    return {
      limited: false,
      remaining: 100,
      limit: 100,
      resetAt: new Date(Date.now() + 60000),
    };
  }
}

/**
 * Check if a user has exceeded their token quota
 * @param apiKey - The API key to check
 * @param tokensRequested - The number of tokens requested
 * @returns True if the quota has been exceeded
 */
export async function checkTokenQuota(apiKey: string, tokensRequested: number = 1): Promise<boolean> {
  try {
    // Get the API key data
    const apiKeyData = await getApiKey(apiKey);
    if (!apiKeyData) {
      return true;
    }
    
    // Pay-as-you-go keys don't have a quota
    if (apiKeyData.tier === 'payg') {
      return false;
    }
    
    // Get the current usage
    const quotaKey = `${REDIS_KEYS.QUOTA}${apiKey}:tokens`;
    const currentUsage = await redis.get(quotaKey);
    
    // If the key doesn't exist, create it
    if (!currentUsage) {
      // Initialize with the current month's usage from Firestore
      await redis.set(quotaKey, apiKeyData.usage_this_month.toString(), { 
        ex: REDIS_TTL.QUOTA_RESET 
      });
      
      // Check if the quota has been exceeded
      return apiKeyData.usage_this_month + tokensRequested > apiKeyData.monthly_quota;
    }
    
    // Check if the quota has been exceeded
    const usage = parseInt(currentUsage as string);
    return usage + tokensRequested > apiKeyData.monthly_quota;
  } catch (error) {
    console.error('Error checking token quota:', error);
    
    // Default to not exceeded in case of error
    return false;
  }
}

/**
 * Update the token quota usage
 * @param apiKey - The API key
 * @param tokensUsed - The number of tokens used
 */
export async function updateTokenQuota(apiKey: string, tokensUsed: number): Promise<void> {
  try {
    // Get the quota key
    const quotaKey = `${REDIS_KEYS.QUOTA}${apiKey}:tokens`;
    
    // Get the current usage
    const currentUsage = await redis.get(quotaKey);
    
    // If the key doesn't exist, create it
    if (!currentUsage) {
      // Get the API key data
      const apiKeyData = await getApiKey(apiKey);
      if (!apiKeyData) {
        return;
      }
      
      // Initialize with the current month's usage from Firestore
      await redis.set(quotaKey, (apiKeyData.usage_this_month + tokensUsed).toString(), { 
        ex: REDIS_TTL.QUOTA_RESET 
      });
    } else {
      // Increment the usage
      const usage = parseInt(currentUsage as string);
      await redis.set(quotaKey, (usage + tokensUsed).toString(), { 
        keepTtl: true 
      });
    }
  } catch (error) {
    console.error('Error updating token quota:', error);
  }
}