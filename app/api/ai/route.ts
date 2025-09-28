import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiKeyFormat, getApiKey, updateApiKeyUsage, logApiKeyUsage } from '@/lib/api/keys';
import { checkRateLimit, checkTokenQuota, updateTokenQuota } from '@/lib/api/rate-limit';
import { getHealthyOpenRouterKey, sendOpenRouterRequest } from '@/lib/openrouter/client';

// Define tier data interface
interface TierConfig {
  default_model: string;
  max_tokens_per_month: number;
  rate_limit_per_minute: number;
}

// Tier configurations - you can move these to environment variables
const TIER_CONFIGS: Record<string, TierConfig> = {
  'free': {
    default_model: 'openai/gpt-3.5-turbo',
    max_tokens_per_month: 10000,
    rate_limit_per_minute: 10,
  },
  'basic': {
    default_model: 'openai/gpt-4o-mini',
    max_tokens_per_month: 100000,
    rate_limit_per_minute: 60,
  },
  'premium': {
    default_model: 'openai/gpt-4',
    max_tokens_per_month: 1000000,
    rate_limit_per_minute: 300,
  },
  'enterprise': {
    default_model: 'openai/gpt-4',
    max_tokens_per_month: 10000000,
    rate_limit_per_minute: 1000,
  }
};

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
 * Get tier configuration safely
 */
function getTierConfig(tierId?: string): TierConfig {
  if (!tierId) return TIER_CONFIGS['free'];
  return TIER_CONFIGS[tierId] || TIER_CONFIGS['free'];
}

/**
 * POST handler for the /api/ai endpoint
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let apiKeyForLogging: string | null = null;
  let ownerUid: string | null = null;

  try {
    // Parse the request body with error handling
    let body: any;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate the request body
    const result = requestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { api_key, prompt, options } = result.data;
    apiKeyForLogging = api_key;
    
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

    ownerUid = apiKeyData.owner_uid;
    
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
    
    // Get the model to use - NO MORE INTERNAL API CALLS
    let model = options?.model;
    if (!model) {
      const tierConfig = getTierConfig(apiKeyData.tier);
      model = tierConfig.default_model;
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
    
    // Validate OpenRouter response
    if (!openRouterResponse?.usage?.total_tokens) {
      throw new Error('Invalid response from OpenRouter - missing usage data');
    }
    
    // Calculate actual token usage
    const tokensUsed = openRouterResponse.usage.total_tokens;
    
    // Update token quota and API key usage with error handling
    try {
      await Promise.all([
        updateTokenQuota(api_key, tokensUsed),
        updateApiKeyUsage(api_key, tokensUsed)
      ]);
    } catch (updateError) {
      console.error('Error updating quotas:', updateError);
      // Continue processing - don't fail the request for quota update errors
    }
    
    // Log the API key usage with error handling
    try {
      await logApiKeyUsage(
        api_key,
        apiKeyData.owner_uid,
        '/api/ai',
        tokensUsed,
        true,
        undefined,
        openRouterKey
      );
    } catch (logError) {
      console.error('Error logging API usage:', logError);
      // Continue processing - don't fail the request for logging errors
    }
    
    // Return the OpenRouter response
    return NextResponse.json(openRouterResponse);
    
  } catch (error: any) {
    console.error('Error in /api/ai:', error);
    
    // Enhanced error logging with safety checks
    if (apiKeyForLogging && ownerUid) {
      try {
        await logApiKeyUsage(
          apiKeyForLogging,
          ownerUid,
          '/api/ai',
          0,
          false,
          error.message || 'Unknown error'
        );
      } catch (logError) {
        console.error('Error logging API usage error:', logError);
      }
    }
    
    // Return appropriate error responses
    if (error.name === 'ValidationError' || error.status === 400) {
      return NextResponse.json(
        { error: 'Bad request', message: error.message },
        { status: 400 }
      );
    }
    
    if (error.status === 401 || error.message?.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API credentials' },
        { status: 401 }
      );
    }
    
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Please try again later' },
        { status: 429 }
      );
    }
    
    if (error.status === 503 || error.message?.includes('service unavailable')) {
      return NextResponse.json(
        { error: 'Service unavailable', message: 'Please try again later' },
        { status: 503 }
      );
    }
    
    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Add runtime configuration to prevent static optimization issues
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';