# Control AI API Integration Guide for Administrators

## Overview

This guide is intended for administrators of the Control AI platform. It explains how to properly set up, configure, and manage the API bridge between your users and OpenRouter.

## System Architecture

The Control AI platform acts as a bridge between your users and OpenRouter's AI models:

```
User Request → Control AI API → OpenRouter API → AI Model → Response → User
```

Key components:
1. **API Gateway**: Handles user requests, validates API keys, and enforces rate limits
2. **OpenRouter Client**: Manages connections to OpenRouter, handles key rotation, and monitors health
3. **Database**: Stores user data, API keys, and usage statistics
4. **Redis Cache**: Handles rate limiting, token quotas, and caching

## Initial Setup

### 1. Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# OpenRouter API Keys
OPENROUTER_KEY_1=your_openrouter_key_1
OPENROUTER_KEY_2=your_openrouter_key_2
OPENROUTER_KEY_3=your_openrouter_key_3
OPENROUTER_KEY_4=your_openrouter_key_4

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Redis Configuration
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token

# Flutterwave Configuration (for payments)
NEXT_PUBLIC_FLW_PUBLIC_KEY=your_flutterwave_public_key
FLW_SECRET_KEY=your_flutterwave_secret_key
FLW_WEBHOOK_SECRET=your_flutterwave_webhook_secret
```

### 2. Database Initialization

Run the seed script to initialize your Firestore database:

```bash
npm run seed
```

This will create:
- Default tiers (free, pro, pay-as-you-go)
- OpenRouter key configurations
- An admin user

### 3. OpenRouter Key Management

#### Adding OpenRouter Keys

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Generate API keys in your dashboard
3. Add them to your environment variables as `OPENROUTER_KEY_1`, `OPENROUTER_KEY_2`, etc.
4. Add them to Firestore through the admin portal:
   - Go to Admin → OpenRouter Keys
   - Click "Add Key"
   - Enter the ID (matching the environment variable index)
   - Enter the environment variable name (e.g., OPENROUTER_KEY_1)
   - Add optional notes

#### Key Rotation Strategy

For production, implement a key rotation strategy:

1. Add a new key to your environment variables and Firestore
2. Wait for the health check to verify the new key is working
3. Remove or disable the old key

### 4. Tier Configuration

Configure the tiers in Firestore to set:
- Default models for each tier
- Rate limits
- Monthly token quotas
- Pricing

## API Configuration

### Model Selection

The API now supports user-specified model selection:

1. Users can specify a model in their request using the `model` parameter
2. The model should be in the format `provider/model-name` (e.g., `openai/gpt-4`)
3. If no model is specified, the default model for the user's tier is used

### Rate Limiting

Rate limiting is configured per tier:
- Free tier: 10 requests/minute
- Pro tier: 60 requests/minute
- Pay-as-you-go tier: 30 requests/minute

To modify these limits:
1. Update the tier documents in Firestore
2. Set the `rate_limit_per_min` field to the desired value

### Token Quotas

Token quotas are also configured per tier:
- Free tier: 10,000 tokens/month
- Pro tier: 1,000,000 tokens/month
- Pay-as-you-go tier: Unlimited (pay per token)

To modify these quotas:
1. Update the tier documents in Firestore
2. Set the `monthly_quota` field to the desired value

## Monitoring and Management

### Health Checks

Set up a cron job to run the health check endpoint regularly:

1. In Vercel, go to Settings → Cron Jobs
2. Add a new cron job:
   - Name: OpenRouter Health Check
   - Path: /api/cron/healthcheck
   - Schedule: */5 * * * * (every 5 minutes)
   - HTTP Method: GET
   - Headers: Authorization: Bearer YOUR_CRON_SECRET

### Usage Monitoring

Monitor API usage through:
1. The admin dashboard
2. Firestore usage logs
3. Redis metrics

Set up alerts for:
- Unusual usage patterns
- High error rates
- Rate limit issues
- Token quota depletion

### User Management

Manage users through the admin portal:
1. View user details and usage statistics
2. Create, revoke, or modify API keys
3. Adjust user tiers and quotas
4. Monitor billing and payments

## Security Best Practices

1. **API Key Security**:
   - Never expose OpenRouter keys in client-side code
   - Rotate OpenRouter keys regularly
   - Store keys securely in environment variables

2. **Rate Limiting**:
   - Implement proper rate limiting per user
   - Set reasonable limits to prevent abuse
   - Monitor for unusual patterns

3. **Access Control**:
   - Restrict admin access to authorized personnel
   - Implement proper authentication and authorization
   - Log all admin actions

4. **Data Protection**:
   - Encrypt sensitive data
   - Implement proper backup procedures
   - Follow data retention policies

## Troubleshooting

### Common Issues

1. **OpenRouter Key Health**:
   - Check the Redis cache for key status
   - Verify keys are valid and not rate-limited
   - Rotate keys if necessary

2. **Rate Limiting Issues**:
   - Check Redis for rate limit counters
   - Verify tier configurations
   - Adjust limits if necessary

3. **Token Quota Issues**:
   - Check user usage statistics
   - Verify quota calculations
   - Adjust quotas if necessary

4. **Database Connection Issues**:
   - Check Firestore connection
   - Verify Firebase credentials
   - Check for database errors in logs

5. **Redis Connection Issues**:
   - Check Redis connection
   - Verify Redis credentials
   - Check for Redis errors in logs

### Logs and Monitoring

- Check server logs for backend issues
- Monitor Redis for rate limiting issues
- Review Firestore for database issues
- Set up alerts for critical errors

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure the environment variables in Vercel
4. Deploy!

### Custom Server Deployment

1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Configure reverse proxy (Nginx/Apache)
4. Set up SSL certificates

## Base URL Configuration

The base URL for API access is:

```
https://your-domain.com/api/ai
```

Users should use this URL for all API requests. Make sure to update the `NEXT_PUBLIC_APP_URL` environment variable to match your actual domain.

## Support

For issues or questions:
- Check the [Configuration Guide](CONFIGURATION_GUIDE.md)
- Review the [OpenRouter API Guide](OPENROUTER_API_GUIDE.md)
- Contact the development team