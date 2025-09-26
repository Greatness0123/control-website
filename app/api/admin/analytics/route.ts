import { NextRequest, NextResponse } from 'next/server';
import { adminMiddleware } from '@/lib/auth/utils';
import { adminDb } from '@/lib/firebase/admin';

/**
 * GET handler for the /api/admin/analytics endpoint
 * Returns usage analytics data
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Check if the user is an admin
  const adminResponse = await adminMiddleware(req);
  if (adminResponse) {
    return adminResponse;
  }
  
  try {
    // Get query parameters
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'day';
    const limit = parseInt(url.searchParams.get('limit') || '30');
    
    // Calculate the start date based on the period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
        break;
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24 hours
    }
    
    // Get usage logs for the period
    const logsSnapshot = await adminDb.collection('usage_logs')
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const logs = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString(),
    }));
    
    // Calculate total tokens used
    const totalTokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
    
    // Calculate success rate
    const successCount = logs.filter(log => log.success).length;
    const successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;
    
    // Get top API keys by usage
    const apiKeyUsage: { [key: string]: number } = {};
    logs.forEach(log => {
      const key = log.api_key;
      apiKeyUsage[key] = (apiKeyUsage[key] || 0) + (log.tokens_used || 0);
    });
    
    const topApiKeys = Object.entries(apiKeyUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, tokens]) => ({ key, tokens }));
    
    // Get top errors
    const errors: { [code: string]: number } = {};
    logs.filter(log => !log.success).forEach(log => {
      const code = log.error_code || 'unknown';
      errors[code] = (errors[code] || 0) + 1;
    });
    
    const topErrors = Object.entries(errors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, count]) => ({ code, count }));
    
    // Get OpenRouter key usage
    const openRouterKeyUsage: { [key: string]: number } = {};
    logs.forEach(log => {
      if (log.openrouter_key_used) {
        const key = log.openrouter_key_used;
        openRouterKeyUsage[key] = (openRouterKeyUsage[key] || 0) + (log.tokens_used || 0);
      }
    });
    
    const openRouterKeys = Object.entries(openRouterKeyUsage)
      .sort((a, b) => b[1] - a[1])
      .map(([key, tokens]) => ({ key, tokens }));
    
    // Return the analytics data
    return NextResponse.json({
      period,
      total_requests: logs.length,
      total_tokens: totalTokens,
      success_rate: successRate,
      top_api_keys: topApiKeys,
      top_errors: topErrors,
      openrouter_keys: openRouterKeys,
      recent_logs: logs.slice(0, 10), // Return only the 10 most recent logs
    });
  } catch (error: any) {
    console.error('Error getting analytics:', error);
    
    return NextResponse.json(
      { error: 'Failed to get analytics', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}