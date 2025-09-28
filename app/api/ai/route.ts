import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiKeyFormat, getApiKey, updateApiKeyUsage, logApiKeyUsage } from '@/lib/api/keys';
import { checkRateLimit, checkTokenQuota, updateTokenQuota } from '@/lib/api/rate-limit';
import { getHealthyOpenRouterKey, sendOpenRouterRequest } from '@/lib/openrouter/client';

// Schema for the request body
const requestSchema = z.object({
  api_key: z.string().min(1),
  prompt: z.string().min(1),
  options: z.object({
    model: z.string().optional(),
    max_tokens: z.number().optional(),
    temperature: z.number().optional(),
    top_p: z.number().optional(),
    stream: z.boolean().optional(),
    stop: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * POST handler for the /api/ai endpoint
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const result = requestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { api_key, prompt, options } = result.data;
    
    // Validate the API key format
    if (!validateApiKeyFormat(api_key)) {
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 400 }
      );
    }
    
    // Get the API key data
    const apiKeyData = await getApiKey(api_key);
    if (!apiKeyData || apiKeyData.status !== 'active') {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      );
    }
    
    // Check rate limits
    const rateLimitResult = await checkRateLimit(api_key);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          limit: rateLimitResult.limit,
          reset_at: rateLimitResult.resetAt.toISOString(),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.floor(rateLimitResult.resetAt.getTime() / 1000).toString(),
          }
        }
      );
    }
    
    // Estimate token usage (very rough estimate)
    const estimatedTokens = Math.ceil(prompt.length / 4) + (options?.max_tokens || 1000);
    
    // Check token quota
    const quotaExceeded = await checkTokenQuota(api_key, estimatedTokens);
    if (quotaExceeded) {
      return NextResponse.json(
        { error: 'Monthly token quota exceeded' },
        { status: 403 }
      );
    }
    
    // Get a healthy OpenRouter key
    const openRouterKey = await getHealthyOpenRouterKey();
    if (!openRouterKey) {
      return NextResponse.json(
        { error: 'No healthy OpenRouter keys available' },
        { status: 503 }
      );
    }
    
    // Get the model to use
    let model = options?.model;
    if (!model) {
      // Get the default model for this tier
      const tierDoc = await fetch(`/api/admin/tiers/${apiKeyData.tier}`);
      const tierData = await tierDoc.json();
      model = tierData.default_model || 'openai/gpt-3.5-turbo';
    }
    
    // Send the request to OpenRouter
    const openRouterResponse = await sendOpenRouterRequest(
      {
        prompt,
        model,
        max_tokens: options?.max_tokens,
        temperature: options?.temperature,
        top_p: options?.top_p,
        stream: options?.stream,
        stop: options?.stop,
      },
      openRouterKey
    );
    
    // Calculate actual token usage
    const tokensUsed = openRouterResponse.usage.total_tokens;
    
    // Update token quota and API key usage
    await updateTokenQuota(api_key, tokensUsed);
    await updateApiKeyUsage(api_key, tokensUsed);
    
    // Log the API key usage
    await logApiKeyUsage(
      api_key,
      apiKeyData.owner_uid,
      '/api/ai',
      tokensUsed,
      true,
      undefined,
      openRouterKey
    );
    
    // Return the OpenRouter response
    return NextResponse.json(openRouterResponse);
  } catch (error: any) {
    console.error('Error in /api/ai:', error);
    
    // Log the error
    try {
      const { api_key } = await req.json();
      if (api_key && validateApiKeyFormat(api_key)) {
        const apiKeyData = await getApiKey(api_key);
        if (apiKeyData) {
          await logApiKeyUsage(
            api_key,
            apiKeyData.owner_uid,
            '/api/ai',
            0,
            false,
            error.message || 'Unknown error'
          );
        }
      }
    } catch (logError) {
      console.error('Error logging API usage error:', logError);
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}