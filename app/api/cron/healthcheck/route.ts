import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { serverTimestamp } from 'firebase-admin/firestore';

// Define interfaces for OpenRouter key
interface OpenRouterKey {
  id: string;
  env_name: string;
  notes?: string;
  status: 'healthy' | 'rate_limited' | 'unhealthy';
  concurrent: number;
  last_checked?: any;
}

// Define settings interface
interface HealthCheckSettings {
  check_interval: number;
  unhealthy_threshold: number;
  rate_limit_cooldown: number;
  routing_policy: string;
}

export async function GET() {
  try {
    // Get all OpenRouter keys
    const keysSnapshot = await db.collection('openrouter_keys').get();
    const keys: OpenRouterKey[] = keysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as OpenRouterKey
    }));

    // Get health check settings
    const settingsDoc = await db.collection('settings').doc('healthcheck').get();
    const settings: HealthCheckSettings = settingsDoc.exists 
      ? settingsDoc.data() as HealthCheckSettings
      : {
          check_interval: 5, // minutes
          unhealthy_threshold: 60, // seconds
          rate_limit_cooldown: 300, // seconds
          routing_policy: 'round_robin'
        };

    // Check each key's health
    const results = await Promise.all(keys.map(async (key) => {
      try {
        // Skip keys that are rate limited and haven't cooled down yet
        if (key.status === 'rate_limited' && key.last_checked) {
          const lastChecked = key.last_checked.toDate();
          const cooldownEnds = new Date(lastChecked.getTime() + settings.rate_limit_cooldown * 1000);
          
          if (cooldownEnds > new Date()) {
            return {
              id: key.id,
              env_name: key.env_name,
              status: 'rate_limited',
              message: 'Skipped check due to rate limit cooldown'
            };
          }
        }

        // Get the actual API key from environment variables
        const apiKey = process.env[key.env_name];
        if (!apiKey) {
          await updateKeyStatus(key.id, 'unhealthy');
          return {
            id: key.id,
            env_name: key.env_name,
            status: 'unhealthy',
            message: 'API key not found in environment variables'
          };
        }

        // Check the key's health with OpenRouter
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), settings.unhealthy_threshold * 1000);
        
        try {
          const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.status === 200) {
            await updateKeyStatus(key.id, 'healthy');
            return {
              id: key.id,
              env_name: key.env_name,
              status: 'healthy',
              message: 'Key is healthy'
            };
          } else if (response.status === 429) {
            await updateKeyStatus(key.id, 'rate_limited');
            return {
              id: key.id,
              env_name: key.env_name,
              status: 'rate_limited',
              message: 'Key is rate limited'
            };
          } else {
            await updateKeyStatus(key.id, 'unhealthy');
            return {
              id: key.id,
              env_name: key.env_name,
              status: 'unhealthy',
              message: `Unexpected status code: ${response.status}`
            };
          }
        } catch (error) {
          clearTimeout(timeoutId);
          
          if (error.name === 'AbortError') {
            await updateKeyStatus(key.id, 'unhealthy');
            return {
              id: key.id,
              env_name: key.env_name,
              status: 'unhealthy',
              message: 'Request timed out'
            };
          }
          
          await updateKeyStatus(key.id, 'unhealthy');
          return {
            id: key.id,
            env_name: key.env_name,
            status: 'unhealthy',
            message: error.message
          };
        }
      } catch (error) {
        console.error(`Error checking key ${key.id}:`, error);
        return {
          id: key.id,
          env_name: key.env_name,
          status: 'unhealthy',
          message: 'Internal error during health check'
        };
      }
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Error in health check:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to update key status
async function updateKeyStatus(keyId: string, status: 'healthy' | 'rate_limited' | 'unhealthy') {
  await db.collection('openrouter_keys').doc(keyId).update({
    status,
    last_checked: serverTimestamp()
  });
}