# Control AI API User Guide

## Introduction

This guide explains how to use the Control AI API to access powerful AI models through OpenRouter. The Control AI platform acts as a bridge between your applications and OpenRouter's AI models, providing additional features like API key management, rate limiting, and usage tracking.

## Getting Started

### 1. Obtain an API Key

Before you can use the API, you need to obtain an API key:

1. Sign up for an account on the Control AI platform
2. Navigate to the Dashboard
3. Click on "API Keys" and then "Create New Key"
4. Select your desired tier (Free, Pro, or Pay-as-you-go)
5. Copy your new API key (format: `ctrl-xxxxxxxxxxxxxxxx`)

### 2. Make Your First API Request

Here's a simple example of how to make a request to the API:

```bash
curl -X POST https://your-domain.com/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "ctrl-xxxxxxxxxxxxxxxx",
    "prompt": "Explain quantum computing in simple terms",
    "model": "openai/gpt-4"
  }'
```

## API Reference

### Base URL

```
https://your-domain.com/api/ai
```

Replace `your-domain.com` with the actual domain where the Control AI platform is hosted.

### Authentication

All requests require an API key in the request body:

```json
{
  "api_key": "ctrl-xxxxxxxxxxxxxxxx"
}
```

### Request Format

The API accepts POST requests with a JSON body containing the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `api_key` | string | Yes | Your Control AI API key |
| `prompt` | string | Yes | The text prompt for the AI model |
| `model` | string | No | The AI model to use (in format `provider/model-name`) |
| `options` | object | No | Additional options for the request |

#### Options Object

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | No | Alternative way to specify the model (top-level `model` takes precedence) |
| `max_tokens` | number | No | Maximum number of tokens to generate (default: 1000) |
| `temperature` | number | No | Controls randomness (0-1, default: 0.7) |
| `top_p` | number | No | Controls diversity via nucleus sampling (0-1, default: 1) |
| `stream` | boolean | No | Whether to stream the response (default: false) |
| `stop` | array | No | Array of strings that will stop generation when encountered |

### Specifying AI Models

You can specify which AI model to use by including the `model` parameter in your request. The model should be specified in the format `provider/model-name`.

#### Example Models

- `openai/gpt-4`
- `openai/gpt-3.5-turbo`
- `anthropic/claude-2`
- `google/gemini-pro`
- `meta/llama-3-70b-instruct`
- `mistral/mistral-7b-instruct`

For a complete list of available models, refer to the [OpenRouter documentation](https://openrouter.ai/docs).

#### Model Selection Priority

1. If you specify a model at the top level of your request, that model will be used
2. If no top-level model is specified but one is included in the `options` object, that model will be used
3. If no model is specified anywhere, the default model for your tier will be used

### Response Format

Successful responses will have a 200 status code and a JSON body with the following structure:

```json
{
  "id": "resp-xxxxxxxxxxxxxxxx",
  "object": "chat.completion",
  "created": 1625097600,
  "model": "openai/gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The response text"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### Error Responses

Error responses will have a non-200 status code and a JSON body with the following structure:

```json
{
  "error": "Error message",
  "message": "Additional error details (optional)"
}
```

Common error codes:

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid request (e.g., missing required parameters) |
| 401 | Invalid or inactive API key |
| 403 | Monthly token quota exceeded |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 503 | No healthy OpenRouter keys available |

## Code Examples

### JavaScript/Node.js

```javascript
async function generateAIResponse(prompt, model = 'openai/gpt-4') {
  const response = await fetch('https://your-domain.com/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: 'ctrl-xxxxxxxxxxxxxxxx',
      prompt,
      model,
      options: {
        max_tokens: 500,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.error}`);
  }

  return await response.json();
}

// Example usage
generateAIResponse('Explain quantum computing in simple terms', 'anthropic/claude-2')
  .then(result => console.log(result.choices[0].message.content))
  .catch(error => console.error(error));
```

### Python

```python
import requests
import json

def generate_ai_response(prompt, model='openai/gpt-4'):
    url = 'https://your-domain.com/api/ai'
    
    payload = {
        'api_key': 'ctrl-xxxxxxxxxxxxxxxx',
        'prompt': prompt,
        'model': model,
        'options': {
            'max_tokens': 500,
            'temperature': 0.7
        }
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code != 200:
        error = response.json()
        raise Exception(f"API error: {error.get('error')}")
    
    return response.json()

# Example usage
try:
    result = generate_ai_response('Explain quantum computing in simple terms', 'google/gemini-pro')
    print(result['choices'][0]['message']['content'])
except Exception as e:
    print(e)
```

## Rate Limits and Quotas

Different tiers have different rate limits and monthly token quotas:

| Tier | Rate Limit | Monthly Quota |
|------|------------|---------------|
| Free | 10 requests/minute | 10,000 tokens |
| Pro | 60 requests/minute | 1,000,000 tokens |
| Pay-as-you-go | 30 requests/minute | Unlimited (pay per token) |

When you exceed your rate limit, the API will return a 429 error with headers indicating the limit and when it resets:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1625097660
```

## Best Practices

1. **Error Handling**: Always implement proper error handling in your code to gracefully handle API errors
2. **Rate Limiting**: Implement exponential backoff for rate limit errors
3. **Model Selection**: Choose the appropriate model for your use case (more powerful models cost more tokens)
4. **Prompt Engineering**: Craft clear, concise prompts to get the best results
5. **Token Management**: Monitor your token usage to avoid exceeding your quota

## Troubleshooting

### Common Issues

1. **"Invalid API key format"**
   - Ensure your API key starts with `ctrl-` followed by 16 characters

2. **"Invalid or inactive API key"**
   - Verify that your API key is active in the dashboard
   - Check that you're using the correct API key

3. **"Rate limit exceeded"**
   - Implement backoff and retry logic
   - Consider upgrading to a higher tier

4. **"Monthly token quota exceeded"**
   - Upgrade to a higher tier
   - Wait for the next billing cycle

5. **"Invalid model format"**
   - Ensure the model follows the format `provider/model-name`
   - Check if the specified model is supported by OpenRouter

## Support

If you encounter any issues or have questions about the API, please contact support through the Control AI platform dashboard or email support@your-domain.com.