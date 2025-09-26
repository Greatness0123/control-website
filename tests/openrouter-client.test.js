/**
 * Tests for OpenRouter client
 */

// Mock Redis client
jest.mock('../lib/redis/client', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    decr: jest.fn(),
  };
  
  return {
    __esModule: true,
    default: mockRedis,
    REDIS_KEYS: {
      OPENROUTER_STATUS: 'openrouter:status:',
      OPENROUTER_CONCURRENT: 'openrouter:concurrent:',
      OPENROUTER_RR_INDEX: 'openrouter:rr_index',
    },
    REDIS_TTL: {
      UNHEALTHY: 60,
      RATE_LIMITED: 300,
    },
    OpenRouterStatus: {
      HEALTHY: 'healthy',
      UNHEALTHY: 'unhealthy',
      RATE_LIMITED: 'rate_limited',
    },
  };
});

// Mock Firebase Admin
jest.mock('../lib/firebase/admin', () => ({
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
      })),
      get: jest.fn(),
    })),
  },
}));

// Mock fetch
global.fetch = jest.fn();

const redis = require('../lib/redis/client').default;
const { REDIS_KEYS, OpenRouterStatus } = require('../lib/redis/client');
const { adminDb } = require('../lib/firebase/admin');
const { getHealthyOpenRouterKey, sendOpenRouterRequest } = require('../lib/openrouter/client');

describe('OpenRouter Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.OPENROUTER_KEY_1 = 'test-key-1';
    process.env.OPENROUTER_KEY_2 = 'test-key-2';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });
  
  describe('getHealthyOpenRouterKey', () => {
    test('returns a healthy key using round-robin policy', async () => {
      // Mock Firestore response
      const mockSnapshot = {
        docs: [
          { id: '1', data: () => ({ status: 'healthy' }) },
          { id: '2', data: () => ({ status: 'healthy' }) },
        ],
      };
      adminDb.collection().get.mockResolvedValue(mockSnapshot);
      
      // Mock Redis responses
      redis.get.mockImplementation((key) => {
        if (key === `${REDIS_KEYS.OPENROUTER_STATUS}1` || key === `${REDIS_KEYS.OPENROUTER_STATUS}2`) {
          return OpenRouterStatus.HEALTHY;
        }
        return null;
      });
      
      redis.incr.mockResolvedValue(1); // First round-robin index
      
      // Get a healthy key
      const key = await getHealthyOpenRouterKey('round_robin');
      
      expect(key).toBe('2'); // Index 1 % 2 = 1, which is the second key (index 1)
      expect(redis.incr).toHaveBeenCalledWith(REDIS_KEYS.OPENROUTER_RR_INDEX);
    });
    
    test('returns a healthy key using least-load policy', async () => {
      // Mock Firestore response
      const mockSnapshot = {
        docs: [
          { id: '1', data: () => ({ status: 'healthy' }) },
          { id: '2', data: () => ({ status: 'healthy' }) },
        ],
      };
      adminDb.collection().get.mockResolvedValue(mockSnapshot);
      
      // Mock Redis responses
      redis.get.mockImplementation((key) => {
        if (key === `${REDIS_KEYS.OPENROUTER_STATUS}1` || key === `${REDIS_KEYS.OPENROUTER_STATUS}2`) {
          return OpenRouterStatus.HEALTHY;
        }
        if (key === `${REDIS_KEYS.OPENROUTER_CONCURRENT}1`) {
          return '5'; // 5 concurrent requests
        }
        if (key === `${REDIS_KEYS.OPENROUTER_CONCURRENT}2`) {
          return '2'; // 2 concurrent requests
        }
        return null;
      });
      
      // Get a healthy key
      const key = await getHealthyOpenRouterKey('least_load');
      
      expect(key).toBe('2'); // Key 2 has fewer concurrent requests
    });
    
    test('filters out unhealthy and rate-limited keys', async () => {
      // Mock Firestore response
      const mockSnapshot = {
        docs: [
          { id: '1', data: () => ({ status: 'healthy' }) },
          { id: '2', data: () => ({ status: 'unhealthy' }) },
          { id: '3', data: () => ({ status: 'rate_limited' }) },
        ],
      };
      adminDb.collection().get.mockResolvedValue(mockSnapshot);
      
      // Mock Redis responses
      redis.get.mockImplementation((key) => {
        if (key === `${REDIS_KEYS.OPENROUTER_STATUS}1`) {
          return OpenRouterStatus.HEALTHY;
        }
        if (key === `${REDIS_KEYS.OPENROUTER_STATUS}2`) {
          return OpenRouterStatus.UNHEALTHY;
        }
        if (key === `${REDIS_KEYS.OPENROUTER_STATUS}3`) {
          return OpenRouterStatus.RATE_LIMITED;
        }
        return null;
      });
      
      redis.incr.mockResolvedValue(0); // First round-robin index
      
      // Get a healthy key
      const key = await getHealthyOpenRouterKey('round_robin');
      
      expect(key).toBe('1'); // Only key 1 is healthy
    });
    
    test('returns null if no healthy keys are available', async () => {
      // Mock Firestore response
      const mockSnapshot = {
        docs: [
          { id: '1', data: () => ({ status: 'unhealthy' }) },
          { id: '2', data: () => ({ status: 'rate_limited' }) },
        ],
      };
      adminDb.collection().get.mockResolvedValue(mockSnapshot);
      
      // Mock Redis responses
      redis.get.mockImplementation((key) => {
        if (key === `${REDIS_KEYS.OPENROUTER_STATUS}1`) {
          return OpenRouterStatus.UNHEALTHY;
        }
        if (key === `${REDIS_KEYS.OPENROUTER_STATUS}2`) {
          return OpenRouterStatus.RATE_LIMITED;
        }
        return null;
      });
      
      // Get a healthy key
      const key = await getHealthyOpenRouterKey('round_robin');
      
      expect(key).toBeNull();
    });
  });
  
  describe('sendOpenRouterRequest', () => {
    test('successfully sends a request to OpenRouter', async () => {
      // Mock fetch response
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'openai/gpt-3.5-turbo',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'This is a test response',
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        }),
      });
      
      // Send a request
      const response = await sendOpenRouterRequest(
        {
          prompt: 'This is a test prompt',
          model: 'openai/gpt-3.5-turbo',
        },
        '1'
      );
      
      // Check that the request was sent correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key-1',
          }),
          body: expect.any(String),
        })
      );
      
      // Check that the response was processed correctly
      expect(response).toEqual(expect.objectContaining({
        id: 'test-id',
        choices: expect.arrayContaining([
          expect.objectContaining({
            message: expect.objectContaining({
              content: 'This is a test response',
            }),
          }),
        ]),
        usage: expect.objectContaining({
          total_tokens: 30,
        }),
      }));
      
      // Check that Redis was updated correctly
      expect(redis.incr).toHaveBeenCalledWith(`${REDIS_KEYS.OPENROUTER_CONCURRENT}1`);
      expect(redis.decr).toHaveBeenCalledWith(`${REDIS_KEYS.OPENROUTER_CONCURRENT}1`);
      expect(redis.set).toHaveBeenCalledWith(
        `${REDIS_KEYS.OPENROUTER_STATUS}1`,
        OpenRouterStatus.HEALTHY
      );
    });
    
    test('handles rate limiting errors', async () => {
      // Mock fetch response for rate limiting
      global.fetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: jest.fn().mockResolvedValue({
          error: {
            message: 'Rate limit exceeded',
            type: 'rate_limit_error',
            code: 429,
          },
        }),
      });
      
      // Send a request and expect it to throw
      await expect(
        sendOpenRouterRequest(
          {
            prompt: 'This is a test prompt',
            model: 'openai/gpt-3.5-turbo',
          },
          '1'
        )
      ).rejects.toThrow('OpenRouter rate limited');
      
      // Check that Redis was updated correctly
      expect(redis.set).toHaveBeenCalledWith(
        `${REDIS_KEYS.OPENROUTER_STATUS}1`,
        OpenRouterStatus.RATE_LIMITED,
        { ex: 300 }
      );
    });
    
    test('handles other errors', async () => {
      // Mock fetch response for other errors
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({
          error: {
            message: 'Internal server error',
            type: 'server_error',
            code: 500,
          },
        }),
      });
      
      // Send a request and expect it to throw
      await expect(
        sendOpenRouterRequest(
          {
            prompt: 'This is a test prompt',
            model: 'openai/gpt-3.5-turbo',
          },
          '1'
        )
      ).rejects.toThrow('OpenRouter error (500)');
      
      // Check that Redis was updated correctly
      expect(redis.set).toHaveBeenCalledWith(
        `${REDIS_KEYS.OPENROUTER_STATUS}1`,
        OpenRouterStatus.UNHEALTHY,
        { ex: 60 }
      );
    });
    
    test('handles network errors', async () => {
      // Mock fetch to throw a network error
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      // Send a request and expect it to throw
      await expect(
        sendOpenRouterRequest(
          {
            prompt: 'This is a test prompt',
            model: 'openai/gpt-3.5-turbo',
          },
          '1'
        )
      ).rejects.toThrow('Network error');
      
      // Check that Redis was updated correctly
      expect(redis.set).toHaveBeenCalledWith(
        `${REDIS_KEYS.OPENROUTER_STATUS}1`,
        OpenRouterStatus.UNHEALTHY,
        { ex: 60 }
      );
    });
  });
});