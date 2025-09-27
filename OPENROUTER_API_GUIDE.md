# OpenRouter API Configuration Guide

## Overview

The Control AI platform provides a proxy API that allows users to access OpenRouter's AI models through your custom domain. This guide explains how to configure and deploy the API proxy.

## API Architecture

### 1. API Endpoint Structure
- **Base URL**: `https://your-domain.com`
- **AI Endpoint**: `POST /api/ai`
- **API Key Format**: `ctrl-xxxxxxxxxxxxxxxx` (16 random characters)

### 2. Request Flow
1. User sends request to your domain (`/api/ai`)
2. Your server validates the API key and checks rate limits
3. Request is forwarded to OpenRouter with your API keys
4. Response is returned to the user

## Configuration Steps

### Step 1: Environment Variables

Create a `.env.local` file in your project root:

```bash
# OpenRouter API Keys (Get these from openrouter.ai)
OPENROUTER_KEY_1=your_openrouter_key_1
OPENROUTER_KEY_2=your_openrouter_key_2
OPENROUTER_KEY_3=your_openrouter_key_3
OPENROUTER_KEY_4=your_openrouter_key_4

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Firebase Configuration (if not already set)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Redis Configuration
REDIS_URL=your_redis_url
```

### Step 2: Get OpenRouter API Keys

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Generate API keys in your dashboard
3. Add them to your environment variables

### Step 3: Deploy to Your Domain

#### Option A: Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Configure custom domain

#### Option B: Custom Server Deployment
1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Configure reverse proxy (Nginx/Apache)
4. Set up SSL certificates

### Step 4: Test the API

#### Create API Key
1. Sign up on your Control AI platform
2. Go to dashboard and create an API key
3. Note the generated key (format: `ctrl-xxxxxxxxxxxxxxxx`)

#### Test Request
```bash
curl -X POST https://your-domain.com/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "ctrl-xxxxxxxxxxxxxxxx",
    "prompt": "Explain quantum computing in simple terms",
    "options": {
      "model": "openai/gpt-4",
      "max_tokens": 500,
      "temperature": 0.7
    }
  }'
```

#### Expected Response
```json
{
  "id": "resp-xxxxxxxxxxxxxxxx",
  "response": "Quantum computing is a type of computation that uses quantum mechanical phenomena...",
  "model": "openai/gpt-4",
  "tokens_used": 125,
  "created_at": "2025-09-26T10:15:30Z"
}
```

## API Reference

### Authentication
All requests require an API key in the request body:
```json
{
  "api_key": "ctrl-xxxxxxxxxxxxxxxx"
}
```

### Endpoints

#### POST /api/ai
Generate AI responses.

**Request Body:**
```json
{
  "api_key": "ctrl-xxxxxxxxxxxxxxxx",
  "prompt": "Your prompt here",
  "options": {
    "model": "openai/gpt-4",
    "max_tokens": 500,
    "temperature": 0.7,
    "top_p": 1,
    "stream": false,
    "stop": ["\n", "User:"]
  }
}
```

**Response:**
```json
{
  "id": "resp-xxxxxxxxxxxxxxxx",
  "response": "Generated text",
  "model": "openai/gpt-4",
  "tokens_used": 125,
  "created_at": "2025-09-26T10:15:30Z"
}
```

### Rate Limits
- **Free Plan**: 10 requests/minute, 10,000 tokens/month
- **Pro Plan**: 60 requests/minute, 1,000,000 tokens/month
- **Pay-as-you-go**: 30 requests/minute, unlimited tokens

### Error Codes
- `400`: Invalid request
- `401`: Invalid API key
- `403`: Quota exceeded
- `429`: Rate limit exceeded
- `500`: Server error

## Monitoring and Management

### Admin Dashboard
Access `/admin` to:
- Monitor API usage
- Manage OpenRouter keys
- View system health
- Manage user accounts

### Health Checks
The system automatically monitors OpenRouter key health and rotates keys as needed.

## Troubleshooting

### Common Issues

1. **"Invalid API key format"**
   - Ensure your API key starts with `ctrl-` followed by 16 characters

2. **"No healthy OpenRouter keys available"**
   - Check your OpenRouter keys in environment variables
   - Verify keys are valid and not rate-limited

3. **"Rate limit exceeded"**
   - Wait for rate limit reset
   - Upgrade to higher plan

4. **"Monthly token quota exceeded"**
   - Upgrade plan or wait for next billing cycle

### Logs and Monitoring
- Check browser console for client-side errors
- Review server logs for backend issues
- Monitor Redis for rate limiting issues

## Security Best Practices

1. **Keep API Keys Secure**: Never expose OpenRouter keys in client-side code
2. **Use HTTPS**: Always serve over HTTPS in production
3. **Rate Limiting**: Implement proper rate limiting per user
4. **Key Rotation**: Regularly rotate OpenRouter keys
5. **Monitor Usage**: Set up alerts for unusual usage patterns

## Support

For issues or questions:
- Check the [Configuration Guide](CONFIGURATION_GUIDE.md)
- Contact support through your dashboard
- Review OpenRouter documentation at openrouter.ai