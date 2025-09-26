/**
 * Tests for rate limiting functionality
 */

// Mock Redis client
jest.mock('../lib/redis/client', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    ttl: jest.fn(),
  };
  
  return {
    __esModule: true,
    default: mockRedis,
    REDIS_KEYS: {
      QUOTA: 'quota:',
    },
    REDIS_TTL: {
      QUOTA_RESET: 86400 * 30,
    },
  };
});

// Mock API key functions
jest.mock('../lib/api/keys', () => ({
  getApiKey: jest.fn(),
}));

const redis = require('../lib/redis/client').default;
const { REDIS_KEYS } = require('../lib/redis/client');
const { getApiKey } = require('../lib/api/keys');
const { checkRateLimit, checkTokenQuota } = require('../lib/api/rate-limit');

describe('Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('checkRateLimit', () => {
    test('allows request when under rate limit', async () => {
      // Mock API key data
      getApiKey.mockResolvedValue({
        tier: 'free',
        status: 'active',
      });
      
      // Mock Redis responses
      redis.get.mockImplementation((key) => {
        if (key === 'tier:free') {
          return JSON.stringify({ rate_limit_per_min: 10 });
        }
        if (key === `${REDIS_KEYS.QUOTA}test-key:rate_limit`) {
          return '5'; // Current count is 5
        }
        return null;
      });
      
      redis.ttl.mockResolvedValue(30); // 30 seconds remaining
      
      // Check rate limit
      const result = await checkRateLimit('test-key');
      
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(4); // 10 - 5 - 1 = 4
      expect(result.limit).toBe(10);
      expect(redis.incr).toHaveBeenCalledWith(`${REDIS_KEYS.QUOTA}test-key:rate_limit`);
    });
    
    test('blocks request when rate limit exceeded', async () => {
      // Mock API key data
      getApiKey.mockResolvedValue({
        tier: 'free',
        status: 'active',
      });
      
      // Mock Redis responses
      redis.get.mockImplementation((key) => {
        if (key === 'tier:free') {
          return JSON.stringify({ rate_limit_per_min: 10 });
        }
        if (key === `${REDIS_KEYS.QUOTA}test-key:rate_limit`) {
          return '10'; // Current count is 10 (at limit)
        }
        return null;
      });
      
      redis.ttl.mockResolvedValue(30); // 30 seconds remaining
      
      // Check rate limit
      const result = await checkRateLimit('test-key');
      
      expect(result.limited).toBe(true);
      expect(result.remaining).toBe(0);
      expect(result.limit).toBe(10);
      expect(redis.incr).not.toHaveBeenCalled();
    });
    
    test('creates new rate limit entry if none exists', async () => {
      // Mock API key data
      getApiKey.mockResolvedValue({
        tier: 'free',
        status: 'active',
      });
      
      // Mock Redis responses
      redis.get.mockImplementation((key) => {
        if (key === 'tier:free') {
          return JSON.stringify({ rate_limit_per_min: 10 });
        }
        return null; // No existing rate limit entry
      });
      
      // Check rate limit
      const result = await checkRateLimit('test-key');
      
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(9); // 10 - 1 = 9
      expect(result.limit).toBe(10);
      expect(redis.set).toHaveBeenCalledWith(
        `${REDIS_KEYS.QUOTA}test-key:rate_limit`,
        '1',
        { ex: 60 }
      );
    });
  });
  
  describe('checkTokenQuota', () => {
    test('allows request when under token quota', async () => {
      // Mock API key data
      getApiKey.mockResolvedValue({
        tier: 'free',
        status: 'active',
        monthly_quota: 10000,
        usage_this_month: 5000,
      });
      
      // Mock Redis responses
      redis.get.mockImplementation((key) => {
        if (key === `${REDIS_KEYS.QUOTA}test-key:tokens`) {
          return '5000'; // Current usage is 5000
        }
        return null;
      });
      
      // Check token quota for 1000 tokens
      const result = await checkTokenQuota('test-key', 1000);
      
      expect(result).toBe(false); // Not exceeded
    });
    
    test('blocks request when token quota exceeded', async () => {
      // Mock API key data
      getApiKey.mockResolvedValue({
        tier: 'free',
        status: 'active',
        monthly_quota: 10000,
        usage_this_month: 9500,
      });
      
      // Mock Redis responses
      redis.get.mockImplementation((key) => {
        if (key === `${REDIS_KEYS.QUOTA}test-key:tokens`) {
          return '9500'; // Current usage is 9500
        }
        return null;
      });
      
      // Check token quota for 1000 tokens
      const result = await checkTokenQuota('test-key', 1000);
      
      expect(result).toBe(true); // Exceeded
    });
    
    test('allows payg tier to bypass quota check', async () => {
      // Mock API key data
      getApiKey.mockResolvedValue({
        tier: 'payg',
        status: 'active',
        monthly_quota: 0,
        usage_this_month: 50000,
      });
      
      // Check token quota for 1000 tokens
      const result = await checkTokenQuota('test-key', 1000);
      
      expect(result).toBe(false); // Not exceeded (payg has no quota)
    });
  });
});