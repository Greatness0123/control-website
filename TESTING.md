# Control Platform Testing Checklist

This document outlines the key testing scenarios that should be verified before deploying the Control Platform to production.

## API Key Validation

- [ ] Key format validation rejects bad formats
  - Verify that keys not matching `ctrl-[A-Za-z0-9]{16}` are rejected
  - Test with various invalid formats (too short, too long, wrong prefix, special characters)

- [ ] DB lookup rejects revoked keys
  - Create a key, revoke it, and verify that API requests with this key are rejected with 401

## Quota and Rate Limiting

- [ ] Quota exhausted returns 403
  - Create a key with a low quota
  - Make requests until the quota is exhausted
  - Verify that subsequent requests return 403

- [ ] Rate limiting works correctly
  - Create a key with a low rate limit (e.g., 5 requests per minute)
  - Make requests in quick succession
  - Verify that requests beyond the limit return 429
  - Verify that the rate limit resets after the specified time

## OpenRouter Integration

- [ ] Single OpenRouter success path works
  - Make a request to the `/api/ai` endpoint
  - Verify that the request is proxied to OpenRouter
  - Verify that the response is returned correctly
  - Verify that usage is logged in Firestore

- [ ] When OpenRouter returns 5xx or times out, retry logic uses next key
  - Configure a test environment with multiple OpenRouter keys
  - Simulate a 5xx error from the first key
  - Verify that the system tries the next key
  - Verify that the error is logged properly

- [ ] 429 from OpenRouter marks key `rate_limited` and routes to others
  - Simulate a 429 error from an OpenRouter key
  - Verify that the key is marked as `rate_limited` in Redis
  - Verify that subsequent requests use a different key
  - Verify that the key becomes available again after the rate limit period

## Admin Functionality

- [ ] Admin can regenerate & revoke keys
  - Log in as an admin
  - Create a new API key
  - Verify that the key works
  - Revoke the key
  - Verify that the key no longer works

- [ ] Admin can view and analyze usage
  - Generate some API usage
  - Log in as an admin
  - Verify that the usage is displayed correctly in the admin dashboard
  - Check that charts and analytics are populated

## Billing Integration

- [ ] Billing events reflect usage logs (Flutterwave)
  - Create a test payment through Flutterwave
  - Simulate a webhook from Flutterwave
  - Verify that the user's subscription or token balance is updated correctly
  - Verify that the transaction is recorded in Firestore

## Health Check

- [ ] Healthcheck cron updates Redis statuses correctly
  - Run the healthcheck endpoint
  - Verify that OpenRouter key statuses are updated in Redis
  - Simulate an unhealthy key and verify that it's marked correctly
  - Verify that the status is also updated in Firestore

## End-to-End Tests

- [ ] Complete user journey works
  - Register a new user
  - Create an API key
  - Make API requests
  - View usage in the dashboard
  - Purchase a subscription or token pack
  - Verify that the quota is updated
  - Revoke the API key

## Performance Tests

- [ ] System handles concurrent requests
  - Make multiple concurrent requests to the `/api/ai` endpoint
  - Verify that all requests are processed correctly
  - Check that rate limiting works correctly under load

- [ ] Redis handles high throughput
  - Simulate high traffic to test Redis performance
  - Verify that Redis operations (get, set, incr, decr) work correctly under load
  - Check for any bottlenecks or performance issues

## Security Tests

- [ ] API endpoints are properly protected
  - Verify that admin endpoints require admin authentication
  - Verify that user endpoints require user authentication
  - Test with invalid or missing authentication

- [ ] Webhook endpoints validate signatures
  - Test the Flutterwave webhook with valid and invalid signatures
  - Verify that invalid signatures are rejected

## Deployment Tests

- [ ] Environment variables are correctly loaded
  - Deploy with different environment configurations
  - Verify that the system uses the correct values

- [ ] Seed script works correctly
  - Run the seed script in a clean environment
  - Verify that the database is populated correctly