# OpenRouter Configuration Guide

## Overview

This guide explains how to properly configure OpenRouter API keys for the Control Website API bridge. The API allows users to access various AI models through OpenRouter, including models like `x-ai/grok-4-fast:free`.

## Authentication Issues Fixed

We've fixed an authentication issue that was occurring when trying to use certain models like `x-ai/grok-4-fast:free`. The issue was related to:

1. Improper model name validation
2. Insufficient error handling for authentication errors
3. Lack of detailed logging for debugging

## Configuration Steps

### 1. Obtain OpenRouter API Keys

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Generate API keys in your dashboard
3. Make sure your API keys have access to the models you want to use (some models may require specific permissions or credits)

### 2. Configure Environment Variables

Add your OpenRouter API keys to your environment variables:

```bash
# OpenRouter API Keys
OPENROUTER_KEY_1=your_openrouter_key_1
OPENROUTER_KEY_2=your_openrouter_key_2
OPENROUTER_KEY_3=your_openrouter_key_3
```

### 3. Add Keys to Firestore

Add your OpenRouter keys to Firestore through the admin portal:

1. Go to Admin → OpenRouter Keys
2. Click "Add Key"
3. Enter the ID (matching the environment variable index)
4. Enter the environment variable name (e.g., OPENROUTER_KEY_1)
5. Add optional notes

### 4. Model Naming Format

When specifying models in API requests, use the correct format:

- Standard format: `provider/model-name` (e.g., `openai/gpt-4`, `anthropic/claude-2`)
- Special formats: 
  - `x-ai/grok-4-fast:free` (note the `:free` suffix)
  - Other models may have similar special formats

## Testing Your Configuration

You can test your configuration with the following curl command:

```bash
curl -X POST https://your-domain.com/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "your-control-api-key",
    "prompt": "Explain quantum computing in simple terms",
    "model": "x-ai/grok-4-fast:free",
    "options": {
      "max_tokens": 500,
      "temperature": 0.7
    }
  }'
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Ensure your OpenRouter API key has access to the requested model
   - Some models may require additional permissions or credits
   - Check the OpenRouter dashboard for any account restrictions

2. **Model Not Found**:
   - Verify the model name is correct and follows the proper format
   - Check if the model is available on OpenRouter
   - Some models may be temporarily unavailable

3. **Rate Limiting**:
   - OpenRouter has rate limits for API requests
   - Consider using multiple API keys for load balancing

### Debugging

If you encounter issues, check the server logs for detailed error messages. The updated code includes enhanced logging that will help identify the source of problems.

## Support

For issues or questions:
- Check the [OpenRouter API Guide](OPENROUTER_API_GUIDE.md)
- Review the [OpenRouter documentation](https://openrouter.ai/docs)
- Contact support through your dashboard