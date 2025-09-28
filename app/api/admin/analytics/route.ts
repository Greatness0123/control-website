import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { isAdmin } from '@/lib/auth/admin';

// Define interfaces for the log data
interface UsageLog {
  id: string;
  timestamp: any;
  api_key?: string;
  endpoint?: string;
  tokens_used?: number;
  success?: boolean;
  error_code?: string;
  openrouter_key_used?: string | null;
  user_id?: string;
}

interface ApiKey {
  id: string;
  name: string;
  owner: string;
  tier: string;
  created_at: any;
  last_used?: any;
  usage: number;
  quota: number;
  status: string;
}

interface UserData {
  id: string;
  email: string;
  displayName?: string;
  plan?: string;
  token_balance?: number;
  created_at?: any;
  last_login?: any;
}

export async function GET(request: NextRequest) {
  try {
    // Check if the user is an admin
    const adminCheck = await isAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';
    const type = searchParams.get('type') || 'usage';

    // Get analytics data based on the type
    let data;
    switch (type) {
      case 'usage':
        data = await getUsageAnalytics(period);
        break;
      case 'users':
        data = await getUserAnalytics();
        break;
      case 'errors':
        data = await getErrorAnalytics(period);
        break;
      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error getting analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get usage analytics
async function getUsageAnalytics(period: string) {
  // Calculate the start time based on the period
  const startTime = getStartTime(period);

  // Get usage logs
  const logsSnapshot = await db.collection('usage_logs')
    .where('timestamp', '>=', startTime)
    .orderBy('timestamp', 'desc')
    .get();

  const logs: UsageLog[] = logsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<UsageLog, 'id'>),
    timestamp: doc.data().timestamp?.toDate()
  }));

  // Calculate total tokens used
  const totalTokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);

  // Calculate success rate
  const successCount = logs.filter(log => log.success).length;
  const successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;

  // Group usage by API key
  const usageByKey: Record<string, number> = {};
  logs.forEach(log => {
    if (log.api_key) {
      usageByKey[log.api_key] = (usageByKey[log.api_key] || 0) + (log.tokens_used || 0);
    }
  });

  // Get top API keys by usage
  const topApiKeys = Object.entries(usageByKey)
    .map(([key, tokens]) => ({ key, tokens }))
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 5);

  // Group errors by type
  const errorTypes: Record<string, number> = {};
  logs.forEach(log => {
    if (!log.success && log.error_code) {
      errorTypes[log.error_code] = (errorTypes[log.error_code] || 0) + 1;
    }
  });

  // Group usage by OpenRouter key
  const usageByOpenRouterKey: Record<string, number> = {};
  logs.forEach(log => {
    if (log.openrouter_key_used) {
      usageByOpenRouterKey[log.openrouter_key_used] = 
        (usageByOpenRouterKey[log.openrouter_key_used] || 0) + (log.tokens_used || 0);
    }
  });

  return {
    totalRequests: logs.length,
    totalTokens,
    successRate,
    topApiKeys,
    errorTypes,
    usageByOpenRouterKey,
    recentLogs: logs.slice(0, 10)
  };
}

// Get user analytics
async function getUserAnalytics() {
  // Get all users
  const usersSnapshot = await db.collection('users').get();
  const users: UserData[] = usersSnapshot.docs.map(doc => {
    const userData = doc.data() as Omit<UserData, 'id'>;
    return {
      id: doc.id,
      ...userData
    };
  });

  // Get all API keys
  const keysSnapshot = await db.collection('api_keys').get();
  const keys: ApiKey[] = keysSnapshot.docs.map(doc => {
    const keyData = doc.data() as Omit<ApiKey, 'id'>;
    return {
      id: doc.id,
      ...keyData
    };
  });

  // Count users by plan
  const usersByPlan: Record<string, number> = {};
  users.forEach(user => {
    const plan = user.plan || 'free';
    usersByPlan[plan] = (usersByPlan[plan] || 0) + 1;
  });

  // Count active API keys
  const activeKeys = keys.filter(key => key.status === 'active').length;

  // Get new users in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const newUsers = users.filter(user => 
    user.created_at && user.created_at.toDate() >= thirtyDaysAgo
  ).length;

  return {
    totalUsers: users.length,
    usersByPlan,
    activeKeys,
    newUsers,
    recentUsers: users
      .filter(user => user.created_at)
      .sort((a, b) => b.created_at.toDate() - a.created_at.toDate())
      .slice(0, 10)
  };
}

// Get error analytics
async function getErrorAnalytics(period: string) {
  // Calculate the start time based on the period
  const startTime = getStartTime(period);

  // Get error logs
  const logsSnapshot = await db.collection('usage_logs')
    .where('timestamp', '>=', startTime)
    .where('success', '==', false)
    .orderBy('timestamp', 'desc')
    .get();

  const errorLogs: UsageLog[] = logsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<UsageLog, 'id'>),
    timestamp: doc.data().timestamp?.toDate()
  }));

  // Group errors by type
  const errorsByType: Record<string, number> = {};
  errorLogs.forEach(log => {
    if (log.error_code) {
      errorsByType[log.error_code] = (errorsByType[log.error_code] || 0) + 1;
    }
  });

  // Group errors by API key
  const errorsByKey: Record<string, number> = {};
  errorLogs.forEach(log => {
    if (log.api_key) {
      errorsByKey[log.api_key] = (errorsByKey[log.api_key] || 0) + 1;
    }
  });

  return {
    totalErrors: errorLogs.length,
    errorsByType,
    errorsByKey,
    recentErrors: errorLogs.slice(0, 10)
  };
}

// Helper function to calculate start time based on period
function getStartTime(period: string): Date {
  const now = new Date();
  
  switch (period) {
    case '1h':
      now.setHours(now.getHours() - 1);
      break;
    case '24h':
      now.setDate(now.getDate() - 1);
      break;
    case '7d':
      now.setDate(now.getDate() - 7);
      break;
    case '30d':
      now.setDate(now.getDate() - 30);
      break;
    case '90d':
      now.setDate(now.getDate() - 90);
      break;
    default:
      now.setDate(now.getDate() - 1); // Default to 24h
  }
  
  return now;
}