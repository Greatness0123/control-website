'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ParticleBackground from '@/components/ui/ParticleBackground';

// Download card component
const DownloadCard = ({ 
  platform, 
  version, 
  size, 
  icon, 
  downloadUrl,
  delay = 0 
}: { 
  platform: string; 
  version: string; 
  size: string;
  icon: string;
  downloadUrl: string;
  delay?: number;
}) => {
  return (
    <motion.div 
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <div className="text-4xl mr-4">{icon}</div>
        <div>
          <h3 className="text-xl font-bold">{platform}</h3>
          <p className="text-sm text-gray-300">Version {version} • {size}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <a 
          href={downloadUrl} 
          className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition text-center"
        >
          Download
        </a>
        <a 
          href={`${downloadUrl}.sig`} 
          className="bg-transparent border border-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition text-center text-sm"
        >
          Signature
        </a>
      </div>
    </motion.div>
  );
};

// Version history item component
const VersionHistoryItem = ({ 
  version, 
  date, 
  highlights 
}: { 
  version: string; 
  date: string; 
  highlights: string[];
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold">Version {version}</h3>
        <span className="text-sm text-gray-300">{date}</span>
      </div>
      <ul className="list-disc list-inside text-gray-300 space-y-1">
        {highlights.map((highlight, index) => (
          <li key={index}>{highlight}</li>
        ))}
      </ul>
    </div>
  );
};

// SDK package component
const SDKPackage = ({ 
  name, 
  language, 
  version, 
  packageManager,
  installCommand,
  docsUrl
}: { 
  name: string; 
  language: string; 
  version: string;
  packageManager: string;
  installCommand: string;
  docsUrl: string;
}) => {
  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{name}</h3>
        <span className="text-sm px-3 py-1 bg-white bg-opacity-10 rounded-full">{language}</span>
      </div>
      <p className="text-sm text-gray-300 mb-4">Version {version} • {packageManager}</p>
      <div className="bg-black bg-opacity-50 p-3 rounded-lg mb-4 font-mono text-sm overflow-x-auto">
        <code>{installCommand}</code>
      </div>
      <a 
        href={docsUrl} 
        className="text-sm hover:underline flex items-center"
      >
        View Documentation
        <span className="ml-1">→</span>
      </a>
    </div>
  );
};

export default function DownloadsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('desktop');

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Downloads</h1>
          <p className="text-xl text-gray-300 mb-8">
            Get Control AI for your platform and start boosting your productivity today.
          </p>
        </motion.div>
      </section>
      
      {/* Tabs */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-full p-1 flex">
            <button 
              className={`px-6 py-2 rounded-full transition ${
                activeTab === 'desktop' ? 'bg-white text-black' : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setActiveTab('desktop')}
            >
              Desktop App
            </button>
            <button 
              className={`px-6 py-2 rounded-full transition ${
                activeTab === 'sdk' ? 'bg-white text-black' : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setActiveTab('sdk')}
            >
              SDK Packages
            </button>
            <button 
              className={`px-6 py-2 rounded-full transition ${
                activeTab === 'history' ? 'bg-white text-black' : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Version History
            </button>
          </div>
        </div>
        
        {/* Desktop App Downloads */}
        {activeTab === 'desktop' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <DownloadCard 
                platform="Windows" 
                version="2.0.1" 
                size="85 MB"
                icon="🪟"
                downloadUrl="/downloads/control-ai-2.0.1-win-x64.exe"
                delay={0.1}
              />
              <DownloadCard 
                platform="macOS" 
                version="2.0.1" 
                size="92 MB"
                icon="🍎"
                downloadUrl="/downloads/control-ai-2.0.1-macos.dmg"
                delay={0.2}
              />
              <DownloadCard 
                platform="Linux" 
                version="2.0.1" 
                size="78 MB"
                icon="🐧"
                downloadUrl="/downloads/control-ai-2.0.1-linux-x64.AppImage"
                delay={0.3}
              />
            </div>
            
            <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">System Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-bold mb-2">Windows</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>Windows 10 or later</li>
                    <li>4 GB RAM minimum</li>
                    <li>200 MB disk space</li>
                    <li>Internet connection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">macOS</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>macOS 11 (Big Sur) or later</li>
                    <li>4 GB RAM minimum</li>
                    <li>200 MB disk space</li>
                    <li>Internet connection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Linux</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>Ubuntu 20.04 or equivalent</li>
                    <li>4 GB RAM minimum</li>
                    <li>200 MB disk space</li>
                    <li>Internet connection</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Installation Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-bold mb-2">Windows</h4>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Download the .exe installer</li>
                    <li>Run the installer</li>
                    <li>Follow the installation wizard</li>
                    <li>Launch Control AI from the Start menu</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-bold mb-2">macOS</h4>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Download the .dmg file</li>
                    <li>Open the .dmg file</li>
                    <li>Drag Control AI to Applications</li>
                    <li>Launch Control AI from Applications</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Linux</h4>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Download the .AppImage file</li>
                    <li>Make it executable (chmod +x)</li>
                    <li>Run the AppImage</li>
                    <li>Optional: Create desktop shortcut</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* SDK Packages */}
        {activeTab === 'sdk' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SDKPackage 
              name="Control AI SDK for JavaScript" 
              language="JavaScript" 
              version="2.0.1"
              packageManager="npm"
              installCommand="npm install @control-ai/sdk"
              docsUrl="/docs/sdk/javascript"
            />
            <SDKPackage 
              name="Control AI SDK for Python" 
              language="Python" 
              version="2.0.1"
              packageManager="pip"
              installCommand="pip install control-ai-sdk"
              docsUrl="/docs/sdk/python"
            />
            <SDKPackage 
              name="Control AI SDK for Ruby" 
              language="Ruby" 
              version="2.0.1"
              packageManager="gem"
              installCommand="gem install control-ai-sdk"
              docsUrl="/docs/sdk/ruby"
            />
            <SDKPackage 
              name="Control AI SDK for Go" 
              language="Go" 
              version="2.0.1"
              packageManager="go"
              installCommand="go get github.com/control-ai/sdk-go"
              docsUrl="/docs/sdk/go"
            />
            <SDKPackage 
              name="Control AI SDK for Java" 
              language="Java" 
              version="2.0.1"
              packageManager="Maven"
              installCommand={`<dependency>\n  <groupId>com.control-ai</groupId>\n  <artifactId>sdk</artifactId>\n  <version>2.0.1</version>\n</dependency>`}
              docsUrl="/docs/sdk/java"
            />
            <SDKPackage 
              name="Control AI SDK for C#" 
              language="C#" 
              version="2.0.1"
              packageManager="NuGet"
              installCommand="Install-Package ControlAI.SDK -Version 2.0.1"
              docsUrl="/docs/sdk/csharp"
            />
          </div>
        )}
        
        {/* Version History */}
        {activeTab === 'history' && (
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6">
            <VersionHistoryItem 
              version="2.0.1" 
              date="September 20, 2025"
              highlights={[
                "Fixed issue with system-wide hotkey on Windows",
                "Improved performance for large text processing",
                "Added support for custom themes",
                "Updated OpenRouter integration"
              ]}
            />
            <VersionHistoryItem 
              version="2.0.0" 
              date="September 1, 2025"
              highlights={[
                "Major release with completely redesigned UI",
                "Added multi-model support via OpenRouter",
                "Introduced custom command creation",
                "Enhanced context awareness across applications",
                "Added offline capabilities for core functions",
                "Improved API with new endpoints and better documentation"
              ]}
            />
            <VersionHistoryItem 
              version="1.5.2" 
              date="August 15, 2025"
              highlights={[
                "Security updates and bug fixes",
                "Improved stability on macOS",
                "Fixed Linux AppImage permissions issue",
                "Updated dependencies"
              ]}
            />
            <VersionHistoryItem 
              version="1.5.0" 
              date="July 28, 2025"
              highlights={[
                "Added initial support for custom commands",
                "Improved response time for common queries",
                "Enhanced clipboard integration",
                "Added support for multiple languages",
                "New keyboard shortcuts for power users"
              ]}
            />
            <VersionHistoryItem 
              version="1.0.0" 
              date="June 1, 2025"
              highlights={[
                "Initial public release",
                "Basic AI assistant functionality",
                "System-wide hotkey access",
                "Simple API for developers",
                "Windows, macOS, and Linux support"
              ]}
            />
          </div>
        )}
      </section>
      
      {/* Support section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-8 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Need Help with Installation?</h2>
          <p className="text-gray-300 mb-6">
            Our support team is ready to assist you with any installation or setup issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/installation" className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition">
              Installation Guide
            </Link>
            <Link href="/contact" className="bg-transparent border border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}