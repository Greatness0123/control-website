// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock the environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project-id',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'test-messaging-sender-id',
  NEXT_PUBLIC_FIREBASE_APP_ID: 'test-app-id',
  FIREBASE_SERVICE_ACCOUNT: '{}',
  NEXT_PUBLIC_FLW_PUBLIC_KEY: 'test-flw-public-key',
  FLW_SECRET_KEY: 'test-flw-secret-key',
  FLW_WEBHOOK_SECRET: 'test-flw-webhook-secret',
  OPENROUTER_KEY_1: 'test-openrouter-key-1',
  REDIS_URL: 'test-redis-url',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'test-nextauth-secret',
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});