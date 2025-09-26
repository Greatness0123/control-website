'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if authentication is still loading
    if (!loading) {
      // If no user is logged in, redirect to login
      if (!user) {
        router.push('/login');
      } 
      // If adminOnly and user is not an admin, redirect to dashboard
      else if (adminOnly) {
        // This would need to be replaced with your actual admin check logic
        // For example, checking a custom claim or a role in the user object
        const isAdmin = user.email?.endsWith('@control-ai.com') || false;
        
        if (!isAdmin) {
          router.push('/dashboard');
        }
      }
    }
  }, [user, loading, router, adminOnly]);

  // Show nothing while loading or redirecting
  if (loading || !user || (adminOnly && !user.email?.endsWith('@control-ai.com'))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // If we have a user and all checks pass, render the children
  return <>{children}</>;
}