import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
  retry: {
    retries: 3,
    backoff: (retryCount) => Math.min(Math.exp(retryCount) * 50, 1000),
  },
});

// Redis key prefixes
export const REDIS_KEYS = {
  OPENROUTER_STATUS: 'openrouter:status:',
  OPENROUTER_CONCURRENT: 'openrouter:concurrent:',
  OPENROUTER_RR_INDEX: 'openrouter:rr_index',
  QUOTA: 'quota:',
  LOCKS: 'locks:',
};

// Redis TTL values (in seconds)
export const REDIS_TTL = {
  UNHEALTHY: 60, // 1 minute
  RATE_LIMITED: 300, // 5 minutes
  QUOTA_RESET: 86400 * 30, // 30 days (monthly quota)
};

// OpenRouter key status values
export enum OpenRouterStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  RATE_LIMITED = 'rate_limited',
}

export default redis;