import { NextRequest } from 'next/server';
import { getAuth } from '@/lib/firebase/admin';

export async function isAdmin(request: NextRequest) {
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

export async function requireAdmin(request: NextRequest) {
  const { isAdmin, userId } = await isAdmin(request);
  
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
  
  return { userId };
}