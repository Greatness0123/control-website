/**
 * Tests for API key validation
 */

const { validateApiKeyFormat } = require('../lib/api/keys');

describe('API Key Validation', () => {
  test('validates correct API key format', () => {
    // Valid API key format: ctrl-{16 alphanumeric characters}
    expect(validateApiKeyFormat('ctrl-1234567890abcdef')).toBe(true);
    expect(validateApiKeyFormat('ctrl-abcdefghijklmnop')).toBe(true);
    expect(validateApiKeyFormat('ctrl-ABCDEFGHIJKLMNOP')).toBe(true);
    expect(validateApiKeyFormat('ctrl-1a2b3c4d5e6f7g8h')).toBe(true);
  });

  test('rejects invalid API key formats', () => {
    // Too short
    expect(validateApiKeyFormat('ctrl-12345')).toBe(false);
    
    // Too long
    expect(validateApiKeyFormat('ctrl-1234567890abcdefghijk')).toBe(false);
    
    // Missing prefix
    expect(validateApiKeyFormat('1234567890abcdef')).toBe(false);
    
    // Wrong prefix
    expect(validateApiKeyFormat('cntrl-1234567890abcdef')).toBe(false);
    
    // Invalid characters
    expect(validateApiKeyFormat('ctrl-1234567890abcde!')).toBe(false);
    expect(validateApiKeyFormat('ctrl-1234567890abcde_')).toBe(false);
    
    // Empty string
    expect(validateApiKeyFormat('')).toBe(false);
    
    // Null or undefined
    expect(validateApiKeyFormat(null)).toBe(false);
    expect(validateApiKeyFormat(undefined)).toBe(false);
  });
});