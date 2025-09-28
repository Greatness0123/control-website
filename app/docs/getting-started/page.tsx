'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Download, 
  User, 
  Key, 
  Code, 
  CheckCircle, 
  ArrowRight,
  Terminal,
  Settings,
  BookOpen
} from 'lucide-react';

// Step component
const Step = ({ 
  number, 
  title, 
  description, 
  children,
  completed = false 
}: { 
  number: number; 
  title: string; 
  description: string; 
  children: React.ReactNode;
  completed?: boolean;
}) => {
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-soft p-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: number * 0.1 }}
    >
      <div className="flex items-start mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${completed ? 'bg-green-500 text-white' : 'bg-black text-white'}`}>
          {completed ? <CheckCircle size={24} /> : <span className="text-xl font-bold">{number}</span>}
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
      <div className="ml-16">
        {children}
      </div>
    </motion.div>
  );
};

// Code block component
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase">{language}</span>
        <button 
          className="text-xs text-gray-400 hover:text-white transition-colors"
          onClick={() => navigator.clipboard.writeText(code)}
        >
          Copy
        </button>
      </div>
      <pre className="text-gray-300 text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default function GettingStartedPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'download', label: 'Download & Install', icon: Download },
    { id: 'account', label: 'Create Account', icon: User },
    { id: 'api', label: 'Get API Key', icon: Key },
    { id: 'first-request', label: 'First API Request', icon: Code },
    { id: 'next-steps', label: 'Next Steps', icon: ArrowRight },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Getting Started</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to set up and start using Control AI in just a few minutes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="sticky top-24 bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-lg font-bold mb-4">Contents</h2>
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? 'bg-black text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={18} className="mr-3" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-6">Welcome to Control AI</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Control AI is a powerful desktop assistant that lets you control your computer and browser using natural language. 
                  This guide will walk you through the setup process and help you make your first API call.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold mb-3">What You'll Learn</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        How to download and install Control Desktop
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Creating your free account
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Generating your first API key
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Making your first API request
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <h3 className="text-xl font-bold mb-3">Before You Start</h3>
                    <p className="text-gray-600 mb-4">Make sure you have:</p>
                    <ul className="space-y-2 text-gray-600">
                      <li>• A computer running Windows 10+, macOS 11+, or Linux</li>
                      <li>• An internet connection</li>
                      <li>• A valid email address</li>
                      <li>• Basic knowledge of APIs (optional)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Terminal className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-blue-800">Quick Start</h4>
                      <p className="text-blue-700">
                        If you're already familiar with APIs and just want to get started quickly, 
                        jump to the <button onClick={() => setActiveSection('api')} className="text-blue-600 underline">API Key section</button>.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Download & Install Section */}
            {activeSection === 'download' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Step 
                  number={1} 
                  title="Download Control Desktop" 
                  description="Choose the right version for your operating system"
                >
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Control Desktop is available for Windows, macOS, and Linux. Download the appropriate version for your system.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-bold mb-2">Windows</h4>
                        <p className="text-sm text-gray-600 mb-3">Windows 10 or later</p>
                        <Link href="/downloads" className="btn btn-sm btn-primary">
                          Download for Windows
                        </Link>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-bold mb-2">macOS</h4>
                        <p className="text-sm text-gray-600 mb-3">macOS 11 or later</p>
                        <Link href="/downloads" className="btn btn-sm btn-primary">
                          Download for macOS
                        </Link>
                      </div>
                      {/* <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-bold mb-2">Linux</h4>
                        <p className="text-sm text-gray-600 mb-3">Ubuntu 20.04+ or equivalent</p>
                        <Link href="/downloads" className="btn btn-sm btn-primary">
                          Download for Linux
                        </Link>
                      </div> */}
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <p className="text-yellow-800">
                        <strong>System Requirements:</strong> 4GB RAM minimum, 200MB disk space, internet connection
                      </p>
                    </div>
                  </div>
                </Step>

                <Step 
                  number={2} 
                  title="Install the Application" 
                  description="Follow the installation steps for your operating system"
                >
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-bold">Windows Installation</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Run the downloaded .exe installer</li>
                        <li>Follow the installation wizard</li>
                        <li>Choose your installation directory</li>
                        <li>Complete the installation</li>
                      </ol>

                      <h4 className="font-bold">macOS Installation</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Open the downloaded .dmg file</li>
                        <li>Drag Control to your Applications folder</li>
                        <li>Launch Control from Applications</li>
                        <li>Allow necessary permissions when prompted</li>
                      </ol>

                      <h4 className="font-bold">Linux Installation</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Make the AppImage executable: <code>chmod +x control-ai.AppImage</code></li>
                        <li>Run the application</li>
                        <li>Follow the setup prompts</li>
                      </ol>
                    </div>
                  </div>
                </Step>
              </motion.div>
            )}

            {/* Create Account Section */}
            {activeSection === 'account' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Step 
                  number={3} 
                  title="Create Your Account" 
                  description="Sign up for a free Control AI account"
                >
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Creating an account gives you access to the API, dashboard, and all features of Control AI.
                    </p>

                    <div className="space-y-4">
                      <h4 className="font-bold">Step 1: Sign Up</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Open Control Desktop</li>
                        <li>Click on "Create Account" or visit <Link href="/signup" className="text-accent hover:underline">our signup page</Link></li>
                        <li>Enter your email address</li>
                        <li>Choose a strong password</li>
                        <li>Verify your email address</li>
                      </ol>

                      <h4 className="font-bold">Step 2: Complete Your Profile</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Add your name and company (optional)</li>
                        <li>Select your preferred language</li>
                        <li>Choose your notification preferences</li>
                        <li>Review and accept the terms of service</li>
                      </ol>
                    </div>

                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <p className="text-green-800">
                        <strong>Tip:</strong> Use a strong, unique password and enable two-factor authentication for added security.
                      </p>
                    </div>
                  </div>
                </Step>
              </motion.div>
            )}

            {/* Get API Key Section */}
            {activeSection === 'api' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Step 
                  number={4} 
                  title="Get Your API Key" 
                  description="Generate your first API key to start making requests"
                >
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <p className="text-red-800">
                        <strong>Important:</strong> the site is currently in beta. API keys are limited and are still in the development phase. Please make use of your personal api keys and your preferred model from openrouter.
                      </p>
                    </div>
                  <div className="space-y-6 pt-6">
                    <p className="text-gray-600">
                      Your API key is your authentication token for making requests to the Control AI API.
                    </p>

                    <div className="space-y-4">
                      <h4 className="font-bold">Step 1: Access the Dashboard</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Log in to your Control AI account</li>
                        <li>Navigate to the dashboard</li>
                        <li>Click on "API Keys" in the sidebar</li>
                      </ol>

                      <h4 className="font-bold">Step 2: Create Your API Key</h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Click "Create New API Key"</li>
                        <li>Give your key a descriptive name (e.g., "Development Key")</li>
                        <li>Click "Create Key"</li>
                        <li>Copy and save your API key securely</li>
                      </ol>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <p className="text-red-800">
                        <strong>Important:</strong> Keep your API key secret and never share it publicly. Treat it like a password.
                      </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                      <p className="text-blue-800">
                        <strong>API Key Format:</strong> Your API key will look like <code>ctrl-xxxxxxxxxxxxxxxx</code> where x are random characters.
                      </p>
                    </div>
                  </div>
                </Step>
              </motion.div>
            )}

            {/* First API Request Section */}
            {activeSection === 'first-request' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Step 
                  number={5} 
                  title="Make Your First API Request" 
                  description="Test your setup with a simple API call"
                >
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Let's make your first API request to ensure everything is working correctly.
                    </p>

                    <div className="space-y-6">
                      <h4 className="font-bold">Using cURL</h4>
                      <p className="text-gray-600">Replace <code>YOUR_API_KEY</code> with your actual API key:</p>
                      <CodeBlock 
                        code={`curl -X POST https://api.control.ai/api/ai \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "YOUR_API_KEY",
    "prompt": "Hello, Control AI!"
  }'`}
                        language="bash"
                      />

                      <h4 className="font-bold">Using JavaScript</h4>
                      <CodeBlock 
                        code={`const response = await fetch('https://api.control.ai/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    api_key: 'YOUR_API_KEY',
    prompt: 'Hello, Control AI!'
  })
});

const data = await response.json();
console.log(data);`}
                        language="javascript"
                      />

                      <h4 className="font-bold">Using Python</h4>
                      <CodeBlock 
                        code={`import requests

response = requests.post('https://api.control.ai/api/ai', json={
    'api_key': 'YOUR_API_KEY',
    'prompt': 'Hello, Control AI!'
})

data = response.json()
print(data)`}
                        language="python"
                      />
                    </div>

                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <p className="text-green-800">
                        <strong>Success!</strong> You should receive a JSON response with the AI's response to your prompt.
                      </p>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <p className="text-yellow-800">
                        <strong>Common Issues:</strong> If you get an error, check that your API key is correct and that you have available tokens in your account.
                      </p>
                    </div>
                  </div>
                </Step>
              </motion.div>
            )}

            {/* Next Steps Section */}
            {activeSection === 'next-steps' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Step 
                  number={6} 
                  title="Next Steps" 
                  description="Continue your journey with Control AI"
                  completed={true}
                >
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Congratulations! You've successfully set up Control AI and made your first API request. Here's what to do next:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-bold">Explore the API</h4>
                        <ul className="space-y-2">
                          <li>
                            <Link href="/docs/api" className="text-accent hover:underline flex items-center">
                              <ArrowRight size={16} className="mr-2" />
                              API Reference Documentation
                            </Link>
                          </li>
                          <li>
                            <Link href="/docs/sdk" className="text-accent hover:underline flex items-center">
                              <ArrowRight size={16} className="mr-2" />
                              SDK Installation Guide
                            </Link>
                          </li>
                          <li>
                            <Link href="/docs/examples" className="text-accent hover:underline flex items-center">
                              <ArrowRight size={16} className="mr-2" />
                              Code Examples
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold">Advanced Features</h4>
                        <ul className="space-y-2">
                          <li>
                            <Link href="/docs/custom-commands" className="text-accent hover:underline flex items-center">
                              <ArrowRight size={16} className="mr-2" />
                              Custom Commands
                            </Link>
                          </li>
                          <li>
                            <Link href="/docs/workflows" className="text-accent hover:underline flex items-center">
                              <ArrowRight size={16} className="mr-2" />
                              Workflow Automation
                            </Link>
                          </li>
                          <li>
                            <Link href="/docs/integrations" className="text-accent hover:underline flex items-center">
                              <ArrowRight size={16} className="mr-2" />
                              Third-party Integrations
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Settings className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-lg font-medium text-blue-800">Need Help?</h4>
                          <p className="text-blue-700">
                            Join our community or contact support if you have any questions:
                          </p>
                          <ul className="mt-2 space-y-1">
                            <li>
                              <Link href="/community" className="text-blue-600 hover:underline">
                                Community Forum
                              </Link>
                            </li>
                            <li>
                              <Link href="/contact" className="text-blue-600 hover:underline">
                                Contact Support
                              </Link>
                            </li>
                            <li>
                              <a href="mailto:support@control.ai" className="text-blue-600 hover:underline">
                                Email: support@control.ai
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link href="/dashboard" className="btn btn-primary px-8 py-3 text-lg inline-flex items-center">
                        Go to Dashboard
                        <ArrowRight size={20} className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </Step>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}