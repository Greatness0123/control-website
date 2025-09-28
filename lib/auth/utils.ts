import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

/**
 * Interface for user data
 */
export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  flutterwaveCustomer?: string;
  plan?: string;
  subscriptionStatus?: string;
  token_balance: number;
  usage: number;
  payg_due: number;
  lastPayment?: Date;
}

/**
 * Get the current user from the request
 * @param req - The Next.js request object
 * @returns The user data or null if not authenticated
 */
export async function getCurrentUser(req: NextRequest): Promise<UserData | null> {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return null;
    }

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken) {
      return null;
    }

    // Get the user data from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return null;
    }

    // Fix the ID conflict issue
    const userData = userDoc.data() as Omit<UserData, 'uid'>;
    
    return {
      uid: decodedToken.uid,
      ...userData,
    } as UserData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if the current user is an admin
 * @param req - The Next.js request object
 * @returns True if the user is an admin
 */
export async function checkIfAdmin(req: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(req);
  return user?.role === 'admin';
}

/**
 * Check if the current user is an admin (alternative name to avoid conflicts)
 * @param req - The Next.js request object
 * @returns True if the user is an admin
 */
export async function isAdmin(req: NextRequest): Promise<boolean> {
  return await checkIfAdmin(req);
}

/**
 * Middleware to protect admin routes
 * @param req - The Next.js request object
 * @returns The Next.js response or null if authorized
 */
export async function adminMiddleware(req: NextRequest): Promise<NextResponse | null> {
  try {
    const isUserAdmin = await checkIfAdmin(req);
    
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    console.error('Error in admin middleware:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Middleware to protect authenticated routes
 * @param req - The Next.js request object
 * @returns The Next.js response or null if authorized
 */
export async function authMiddleware(req: NextRequest): Promise<NextResponse | null> {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    return null;
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get user data with proper error handling
 * @param req - The Next.js request object
 * @returns User data or throws error
 */
export async function requireAuth(req: NextRequest): Promise<UserData> {
  const user = await getCurrentUser(req);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Get admin user data with proper error handling
 * @param req - The Next.js request object
 * @returns Admin user data or throws error
 */
export async function requireAdmin(req: NextRequest): Promise<UserData> {
  const user = await getCurrentUser(req);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return user;
}