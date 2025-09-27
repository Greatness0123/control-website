'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { auth } from '@/lib/firebase/client';
import { useAuthState } from 'react-firebase-hooks/auth';

interface NavLink {
  name: string;
  href: string;
  children?: NavLink[];
}

const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  // { 
  //   name: 'Docs', 
  //   href: '/docs',
  //   children: [
  //     { name: 'Getting Started', href: '/docs/getting-started' },
  //     { name: 'API Reference', href: '/docs/api' },
  //     { name: 'Command Explorer', href: '/command-explorer' },
  //   ]
  // },
  { name: 'Pricing', href: '/pricing' },
  // { name: 'Blog', href: '/blog' },
  // { name: 'Community', href: '/community' },
  { name: 'Download', href: '/downloads' },
  { name: 'Contact', href: '/contact' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const [user, loading] = useAuthState(auth);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          {/* <Link href="/" className="flex items-center"> */}
            <Image 
              src="/logo.png" 
              alt="Control Logo" 
              width={40} 
              height={40} 
              className="mr-2"
            />
            <span className={`font-bold text-xl ${scrolled ? 'text-black' : 'text-white'}`}>
              Control
            </span>
          {/* </Link> */}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <div key={link.name} className="relative">
                {link.children ? (
                  <div>
                    <button
                      className={`flex items-center px-1 py-2 text-sm font-medium ${
                        scrolled ? 'text-gray-800 hover:text-black' : 'text-gray-200 hover:text-white'
                      } ${pathname.startsWith(link.href) ? 'font-bold' : ''}`}
                      onClick={() => setDropdownOpen(dropdownOpen === link.name ? null : link.name)}
                    >
                      {link.name}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <AnimatePresence>
                      {dropdownOpen === link.name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                        >
                          <div className="py-1">
                            {link.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                                  pathname === child.href ? 'font-bold bg-gray-50' : ''
                                }`}
                                onClick={() => setDropdownOpen(null)}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className={`px-1 py-2 text-sm font-medium ${
                      scrolled ? 'text-gray-800 hover:text-black' : 'text-gray-200 hover:text-white'
                    } ${pathname === link.href ? 'font-bold' : ''}`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-4 py-2 rounded-2xl ${
                      scrolled 
                        ? 'text-black hover:bg-gray-100' 
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    } transition-colors`}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className={scrolled ? 'text-black' : 'text-white'} />
            ) : (
              <Menu className={scrolled ? 'text-black' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.children ? (
                      <div>
                        <button
                          className={`flex items-center justify-between w-full px-1 py-2 text-gray-800 hover:text-black ${
                            pathname.startsWith(link.href) ? 'font-bold' : ''
                          }`}
                          onClick={() => setDropdownOpen(dropdownOpen === link.name ? null : link.name)}
                        >
                          {link.name}
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                            dropdownOpen === link.name ? 'rotate-180' : ''
                          }`} />
                        </button>
                        <AnimatePresence>
                          {dropdownOpen === link.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-4 mt-2 border-l-2 border-gray-200"
                            >
                              {link.children.map((child) => (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  className={`block py-2 text-gray-700 hover:text-black ${
                                    pathname === child.href ? 'font-bold' : ''
                                  }`}
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className={`block px-1 py-2 text-gray-800 hover:text-black ${
                          pathname === link.href ? 'font-bold' : ''
                        }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  {!loading && (
                    user ? (
                      <Link
                        href="/dashboard"
                        className="block w-full py-2 text-center rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors"
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <Link
                          href="/login"
                          className="block w-full py-2 text-center rounded-2xl border border-black text-black hover:bg-gray-100 transition-colors"
                        >
                          Log In
                        </Link>
                        <Link
                          href="/signup"
                          className="block w-full py-2 text-center rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                          Sign Up
                        </Link>
                      </div>
                    )
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}