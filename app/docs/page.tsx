'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ParticleBackground from '@/components/ui/ParticleBackground';

// Documentation category component
const DocCategory = ({ 
  title, 
  description, 
  icon, 
  link, 
  delay = 0 
}: { 
  title: string; 
  description: string; 
  icon: string;
  link: string;
  delay?: number;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link href={link} className="block bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 hover:bg-opacity-10 transition">
        <div className="mb-4 p-3 bg-white bg-opacity-10 rounded-full inline-block">
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </Link>
    </motion.div>
  );
};

export default function DocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      
      {/* Hero section */}
      <section className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Documentation</h1>
          <p className="text-xl text-gray-300 mb-8">
            Everything you need to know about using Control AI effectively.
          </p>
        </motion.div>
      </section>
      
      {/* Documentation categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <DocCategory 
            title="Getting Started" 
            description="Learn the basics of Control AI and set up your environment for optimal use."
            icon="🚀"
            link="/docs/getting-started"
            delay={0.1}
          />
          <DocCategory 
            title="API Reference" 
            description="Comprehensive documentation for the Control AI API endpoints and parameters."
            icon="🔌"
            link="/docs/api"
            delay={0.2}
          />
          <DocCategory 
            title="Desktop App" 
            description="Installation guides and usage instructions for the Control AI desktop application."
            icon="💻"
            link="/docs/desktop-app"
            delay={0.3}
          />
          <DocCategory 
            title="Command Reference" 
            description="Explore the full list of built-in commands and learn how to create custom ones."
            icon="⌨️"
            link="/docs/commands"
            delay={0.4}
          />
          <DocCategory 
            title="Integrations" 
            description="Connect Control AI with your favorite tools and services for enhanced productivity."
            icon="🔄"
            link="/docs/integrations"
            delay={0.5}
          />
          <DocCategory 
            title="Troubleshooting" 
            description="Solutions to common issues and answers to frequently asked questions."
            icon="🔧"
            link="/docs/troubleshooting"
            delay={0.6}
          />
        </div>
      </section>
      
      {/* Popular guides */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Popular Guides</h2>
        <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6">
          <ul className="space-y-4">
            <li>
              <Link href="/docs/getting-started/installation" className="flex items-center justify-between hover:text-gray-300 transition">
                <span>Installing Control AI on Windows, macOS, and Linux</span>
                <span>→</span>
              </Link>
            </li>
            <li className="border-t border-white border-opacity-10 pt-4">
              <Link href="/docs/api/authentication" className="flex items-center justify-between hover:text-gray-300 transition">
                <span>API Authentication and Key Management</span>
                <span>→</span>
              </Link>
            </li>
            <li className="border-t border-white border-opacity-10 pt-4">
              <Link href="/docs/commands/custom-commands" className="flex items-center justify-between hover:text-gray-300 transition">
                <span>Creating and Sharing Custom Commands</span>
                <span>→</span>
              </Link>
            </li>
            <li className="border-t border-white border-opacity-10 pt-4">
              <Link href="/docs/integrations/vscode" className="flex items-center justify-between hover:text-gray-300 transition">
                <span>VS Code Integration Guide</span>
                <span>→</span>
              </Link>
            </li>
            <li className="border-t border-white border-opacity-10 pt-4">
              <Link href="/docs/troubleshooting/connectivity" className="flex items-center justify-between hover:text-gray-300 transition">
                <span>Resolving Connectivity Issues</span>
                <span>→</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
      
      {/* Video tutorials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Video Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg overflow-hidden">
            <div className="aspect-video bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-4xl">▶️</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">Getting Started with Control AI</h3>
              <p className="text-sm text-gray-300">10:24 • Learn the basics in this comprehensive introduction</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg overflow-hidden">
            <div className="aspect-video bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-4xl">▶️</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">Advanced Command Creation</h3>
              <p className="text-sm text-gray-300">15:37 • Master the art of custom command creation</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg overflow-hidden">
            <div className="aspect-video bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-4xl">▶️</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">API Integration Tutorial</h3>
              <p className="text-sm text-gray-300">12:05 • Connect your applications to Control AI</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Support section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Additional Help?</h2>
          <p className="text-gray-300 mb-6">
            Our support team is ready to assist you with any questions or issues you may have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition">
              Contact Support
            </Link>
            <Link href="/community" className="bg-transparent border border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition">
              Join Community
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}