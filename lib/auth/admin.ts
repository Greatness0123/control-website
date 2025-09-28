import { NextRequest } from 'next/server';
import { getAuth } from '@/lib/firebase/admin';

interface AdminCheckResult {
  isAdmin: boolean;
  userId: string | null;
}

export async function checkAdminStatus(request: NextRequest): Promise<AdminCheckResult> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false, userId: null };
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check if user has admin role (you'll need to implement this based on your data structure)
    // For now, let's assume we check a custom claim or database field
    const hasAdminRole = decodedToken.admin === true || false; // Default to false

    return { isAdmin: hasAdminRole, userId };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { isAdmin: false, userId: null };
  }
}

// Keep the original function name for backward compatibility, but call the renamed function
export async function isAdmin(request: NextRequest): Promise<AdminCheckResult> {
  return await checkAdminStatus(request);
}

export async function requireAdmin(request: NextRequest): Promise<{ userId: string }> {
  const adminResult = await checkAdminStatus(request);
  
  if (!adminResult.isAdmin) {
    throw new Error('Admin access required');
  }
  
  return { userId: adminResult.userId! }; // Non-null assertion since we know isAdmin is true
}