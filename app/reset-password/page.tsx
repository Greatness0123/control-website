'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { useAuth } from '@/components/auth/AuthContext';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resetPassword } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <ParticleBackground />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo.png" 
                alt="Control AI" 
                width={120} 
                height={120} 
                className="mx-auto mb-6"
              />
            </Link>
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-gray-300">
              Enter your email to receive a password reset link
            </p>
          </div>
          
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-8">
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 mb-6">
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {success ? (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg p-4 mb-6">
                <p className="text-sm">
                  Password reset link sent! Check your email inbox and follow the instructions to reset your password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                Remember your password?{' '}
                <Link href="/login" className="text-white hover:underline">
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}