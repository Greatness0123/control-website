'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthContext';

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle scroll lock when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Blog', href: '/blog' },
    { name: 'Community', href: '/community' },
    { name: 'Downloads', href: '/downloads' },
    { name: 'Command Explorer', href: '/command-explorer' },
    { name: 'Contact', href: '/contact' },
  ];

  const authItems = user
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'API Keys', href: '/dashboard/keys' },
        { name: 'Usage', href: '/dashboard/usage' },
        { name: 'Settings', href: '/dashboard/settings' },
      ]
    : [];

  // Add admin items if user is admin (this is a simplified check)
  const adminItems = user && user.email?.endsWith('@control-ai.com')
    ? [
        { name: 'Admin Dashboard', href: '/admin' },
        { name: 'Manage Users', href: '/admin/users' },
        { name: 'Manage Keys', href: '/admin/keys' },
      ]
    : [];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-black border-l border-white border-opacity-10 z-50 md:hidden overflow-y-auto"
          >
            <div className="p-4 flex justify-between items-center border-b border-white border-opacity-10">
              <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                <Image src="/logo.png" alt="Control AI" width={40} height={40} className="mr-2" />
                <span className="font-bold text-xl">Control AI</span>
              </Link>
              <button
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <nav className="space-y-6">
                {/* Main navigation */}
                <div>
                  <h3 className="text-sm uppercase text-gray-400 mb-2">Navigation</h3>
                  <ul className="space-y-2">
                    {menuItems.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`block py-2 px-3 rounded-lg transition ${
                            pathname === item.href
                              ? 'bg-white bg-opacity-10 font-medium'
                              : 'hover:bg-white hover:bg-opacity-5'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* User navigation (when logged in) */}
                {user && authItems.length > 0 && (
                  <div>
                    <h3 className="text-sm uppercase text-gray-400 mb-2">Account</h3>
                    <ul className="space-y-2">
                      {authItems.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`block py-2 px-3 rounded-lg transition ${
                              pathname === item.href
                                ? 'bg-white bg-opacity-10 font-medium'
                                : 'hover:bg-white hover:bg-opacity-5'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Admin navigation (when user is admin) */}
                {adminItems.length > 0 && (
                  <div>
                    <h3 className="text-sm uppercase text-gray-400 mb-2">Admin</h3>
                    <ul className="space-y-2">
                      {adminItems.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`block py-2 px-3 rounded-lg transition ${
                              pathname === item.href
                                ? 'bg-white bg-opacity-10 font-medium'
                                : 'hover:bg-white hover:bg-opacity-5'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Auth buttons */}
                <div className="pt-4 border-t border-white border-opacity-10">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 truncate">
                          <div className="font-medium">{user.displayName || 'User'}</div>
                          <div className="text-sm text-gray-400 truncate">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                        className="w-full py-2 px-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition text-center"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Link
                        href="/login"
                        className="py-2 px-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition text-center"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="py-2 px-3 bg-white text-black rounded-lg transition text-center"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}