import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import redis, { REDIS_KEYS, REDIS_TTL, OpenRouterStatus } from '@/lib/redis/client';

/**
 * GET handler for the /api/cron/healthcheck endpoint
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Check for a secret key to protect the endpoint
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing credentials' },
        { status: 401 }
      );
    }
    
    // Get all OpenRouter keys from Firestore
    const keysSnapshot = await adminDb.collection('openrouter_keys').get();
    const keys = keysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Check the health of each key
    const results = await Promise.all(
      keys.map(async (key) => {
        try {
          // Make a simple request to OpenRouter to check the key's health
          const envKey = process.env[`OPENROUTER_KEY_${key.id}`] || process.env.OPENROUTER_KEY_1;
          
          if (!envKey) {
            throw new Error('No OpenRouter key available');
          }
          
          const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${envKey}`,
              'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
              'X-Title': 'Control Desktop',
            },
            timeout: 5000, // 5 seconds timeout
          });
          
          // Check the response
          if (!response.ok) {
            // If rate limited, mark as rate limited
            if (response.status === 429) {
              await redis.set(
                `${REDIS_KEYS.OPENROUTER_STATUS}${key.id}`,
                OpenRouterStatus.RATE_LIMITED,
                { ex: REDIS_TTL.RATE_LIMITED }
              );
              
              await adminDb.collection('openrouter_keys').doc(key.id).update({
                status: OpenRouterStatus.RATE_LIMITED,
                last_checked: new Date(),
              });
              
              return {
                id: key.id,
                status: OpenRouterStatus.RATE_LIMITED,
                error: 'Rate limited',
              };
            }
            
            // Otherwise, mark as unhealthy
            await redis.set(
              `${REDIS_KEYS.OPENROUTER_STATUS}${key.id}`,
              OpenRouterStatus.UNHEALTHY,
              { ex: REDIS_TTL.UNHEALTHY }
            );
            
            await adminDb.collection('openrouter_keys').doc(key.id).update({
              status: OpenRouterStatus.UNHEALTHY,
              last_checked: new Date(),
            });
            
            return {
              id: key.id,
              status: OpenRouterStatus.UNHEALTHY,
              error: `HTTP ${response.status}: ${response.statusText}`,
            };
          }
          
          // Mark as healthy
          await redis.set(
            `${REDIS_KEYS.OPENROUTER_STATUS}${key.id}`,
            OpenRouterStatus.HEALTHY
          );
          
          await adminDb.collection('openrouter_keys').doc(key.id).update({
            status: OpenRouterStatus.HEALTHY,
            last_checked: new Date(),
          });
          
          return {
            id: key.id,
            status: OpenRouterStatus.HEALTHY,
          };
        } catch (error: any) {
          // Mark as unhealthy
          await redis.set(
            `${REDIS_KEYS.OPENROUTER_STATUS}${key.id}`,
            OpenRouterStatus.UNHEALTHY,
            { ex: REDIS_TTL.UNHEALTHY }
          );
          
          await adminDb.collection('openrouter_keys').doc(key.id).update({
            status: OpenRouterStatus.UNHEALTHY,
            last_checked: new Date(),
          });
          
          return {
            id: key.id,
            status: OpenRouterStatus.UNHEALTHY,
            error: error.message || 'Unknown error',
          };
        }
      })
    );
    
    // Return the results
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      keys_checked: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error in healthcheck:', error);
    
    return NextResponse.json(
      { error: 'Healthcheck failed', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}