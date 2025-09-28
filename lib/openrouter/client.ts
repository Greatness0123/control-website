import { adminDb } from '../firebase/admin';
import redis, { REDIS_KEYS, REDIS_TTL, OpenRouterStatus } from '../redis/client';

// OpenRouter API URL
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Interface for OpenRouter request options
interface OpenRouterRequestOptions {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  stop?: string[];
}

// Interface for OpenRouter response
interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Interface for OpenRouter error
interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

// Interface for OpenRouter key
interface OpenRouterKey {
  id: string;
  env_name: string;
  notes: string;
  status: string;
  last_checked: Date;
}

/**
 * Get all available OpenRouter keys from Firestore
 */
export async function getOpenRouterKeys(): Promise<OpenRouterKey[]> {
  const keysSnapshot = await adminDb.collection('openrouter_keys').get();
  return keysSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as OpenRouterKey));
}

/**
 * Get a healthy OpenRouter key using the specified routing policy
 * @param policy - The routing policy to use (round_robin or least_load)
 * @returns The selected OpenRouter key or null if none available
 */
export async function getHealthyOpenRouterKey(policy: 'round_robin' | 'least_load' = 'round_robin'): Promise<string | null> {
  // Get all OpenRouter keys
  const keys = await getOpenRouterKeys();
  if (!keys.length) return null;

  // Filter out keys that are marked as unhealthy or rate limited in Redis
  const healthyKeys: string[] = [];
  
  for (const key of keys) {
    const status = await redis.get(`${REDIS_KEYS.OPENROUTER_STATUS}${key.id}`);
    if (!status || status === OpenRouterStatus.HEALTHY) {
      healthyKeys.push(key.id);
    }
  }

  if (!healthyKeys.length) return null;

  // Select a key based on the routing policy
  if (policy === 'round_robin') {
    // Get the current round-robin index
    const index = await redis.incr(REDIS_KEYS.OPENROUTER_RR_INDEX);
    return healthyKeys[(index - 1) % healthyKeys.length];
  } else if (policy === 'least_load') {
    // Get the concurrent count for each key
    const concurrentCounts = await Promise.all(
      healthyKeys.map(async (key) => {
        const count = await redis.get(`${REDIS_KEYS.OPENROUTER_CONCURRENT}${key}`);
        return { key, count: count ? parseInt(count as string) : 0 };
      })
    );

    // Sort by concurrent count (ascending)
    concurrentCounts.sort((a, b) => a.count - b.count);
    return concurrentCounts[0].key;
  }

  return null;
}

/**
 * Send a request to OpenRouter
 * @param options - The request options
 * @param apiKey - The API key to use
 * @returns The OpenRouter response
 */
export async function sendOpenRouterRequest(
  options: OpenRouterRequestOptions,
  apiKey: string
): Promise<OpenRouterResponse> {
  // Increment the concurrent count for this key
  await redis.incr(`${REDIS_KEYS.OPENROUTER_CONCURRENT}${apiKey}`);

  try {
    // Get the actual OpenRouter key from environment variables
    const envKey = process.env[`OPENROUTER_KEY_${apiKey}`] || process.env.OPENROUTER_KEY_1;
    
    if (!envKey) {
      throw new Error(`OpenRouter API key not found for key: ${apiKey}`);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // Send the request to OpenRouter
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${envKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Control Desktop',
        },
        body: JSON.stringify({
          model: options.model || 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: options.prompt,
            },
          ],
          max_tokens: options.max_tokens || 1000,
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 1,
          stream: options.stream || false,
          stop: options.stop || [],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check for errors
      if (!response.ok) {
        const errorData = await response.json() as OpenRouterError;
        
        // Handle rate limiting
        if (response.status === 429) {
          await redis.set(
            `${REDIS_KEYS.OPENROUTER_STATUS}${apiKey}`,
            OpenRouterStatus.RATE_LIMITED,
            { ex: REDIS_TTL.RATE_LIMITED }
          );
          throw new Error(`OpenRouter rate limited: ${errorData.error.message}`);
        }
        
        // Handle other errors
        await redis.set(
          `${REDIS_KEYS.OPENROUTER_STATUS}${apiKey}`,
          OpenRouterStatus.UNHEALTHY,
          { ex: REDIS_TTL.UNHEALTHY }
        );
        throw new Error(`OpenRouter error (${response.status}): ${errorData.error.message}`);
      }

      // Parse the response
      const data = await response.json() as OpenRouterResponse;
      
      // Mark the key as healthy
      await redis.set(
        `${REDIS_KEYS.OPENROUTER_STATUS}${apiKey}`,
        OpenRouterStatus.HEALTHY
      );

      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    // Mark the key as unhealthy
    await redis.set(
      `${REDIS_KEYS.OPENROUTER_STATUS}${apiKey}`,
      OpenRouterStatus.UNHEALTHY,
      { ex: REDIS_TTL.UNHEALTHY }
    );
    throw error;
  } finally {
    // Decrement the concurrent count
    await redis.decr(`${REDIS_KEYS.OPENROUTER_CONCURRENT}${apiKey}`);
  }
}