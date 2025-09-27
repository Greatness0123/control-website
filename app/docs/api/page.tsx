'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Terminal, Key, Shield, Clock, AlertCircle, Code, Mail } from 'lucide-react';
import Link from 'next/link';

// Code snippet examples
const codeExamples = {
  javascript: `// Using fetch API
const response = await fetch('https://api.control.ai/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    api_key: 'ctrl-xxxxxxxxxxxxxxxx',
    prompt: 'Explain how to use the Control API',
    options: {
      model: 'openai/gpt-4',
      max_tokens: 500,
      temperature: 0.7
    }
  })
});

const data = await response.json();
console.log(data.response);`,

  python: `import requests

response = requests.post(
    'https://api.control.ai/api/ai',
    json={
        'api_key': 'ctrl-xxxxxxxxxxxxxxxx',
        'prompt': 'Explain how to use the Control API',
        'options': {
            'model': 'openai/gpt-4',
            'max_tokens': 500,
            'temperature': 0.7
        }
    }
)

data = response.json()
print(data['response'])`,

  curl: `curl -X POST https://api.control.ai/api/ai \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "ctrl-xxxxxxxxxxxxxxxx",
    "prompt": "Explain how to use the Control API",
    "options": {
      "model": "openai/gpt-4",
      "max_tokens": 500,
      "temperature": 0.7
    }
  }'`
};

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState('javascript');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Control AI API Documentation
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Integrate powerful AI capabilities into your applications with our simple and flexible API.
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <a href="#getting-started" className="btn btn-primary">
                Get Started
              </a>
              <a href="#api-reference" className="btn btn-secondary">
                API Reference
              </a>
            </motion.div>
          </div>
        </section>

        {/* Getting Started */}
        <section id="getting-started" className="py-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Getting Started</h2>
          
          {/* API Key */}
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
            <div className="flex items-start mb-4">
              <div className="bg-black rounded-full p-3 mr-4">
                <Key className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">1. Get Your API Key</h3>
                <p className="text-gray-600 mb-4">
                  To use the Control AI API, you'll need an API key. You can get one by signing up for an account and creating an API key in your dashboard.
                </p>
                <Link href="/signup" className="btn btn-sm btn-primary">
                  Sign Up for API Access
                </Link>
              </div>
            </div>
          </div>
          
          {/* Make Your First Request */}
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
            <div className="flex items-start mb-6">
              <div className="bg-black rounded-full p-3 mr-4">
                <Terminal className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">2. Make Your First Request</h3>
                <p className="text-gray-600 mb-4">
                  Once you have your API key, you can start making requests to the Control AI API. Here's a simple example:
                </p>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex border-b border-gray-700">
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'javascript' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('javascript')}
                >
                  JavaScript
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'python' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('python')}
                >
                  Python
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'curl' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('curl')}
                >
                  cURL
                </button>
                <div className="ml-auto">
                  <button
                    className="px-4 py-2 text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard(codeExamples[activeTab as keyof typeof codeExamples], activeTab)}
                    aria-label="Copy code"
                  >
                    {copiedSection === activeTab ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <pre className="p-4 text-gray-300 overflow-x-auto">
                <code>{codeExamples[activeTab as keyof typeof codeExamples]}</code>
              </pre>
            </div>
          </div>
          
          {/* Authentication */}
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
            <div className="flex items-start mb-4">
              <div className="bg-black rounded-full p-3 mr-4">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">3. Authentication</h3>
                <p className="text-gray-600 mb-4">
                  All API requests require authentication. You can authenticate by including your API key in the request body.
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <code className="text-sm">
                    {`{
  "api_key": "ctrl-xxxxxxxxxxxxxxxx",
  "prompt": "Your prompt here"
}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section id="api-reference" className="py-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">API Reference</h2>
          
          {/* Endpoints */}
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
            <h3 className="text-xl font-bold mb-6">Endpoints</h3>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">POST</span>
                <code className="text-lg font-mono">/api/ai</code>
              </div>
              <p className="text-gray-600 mb-4">
                Generate AI responses based on your prompt.
              </p>
              
              <div className="mt-6">
                <h4 className="font-bold mb-2">Request Body</h4>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <code className="text-sm">
                    {`{
  "api_key": "ctrl-xxxxxxxxxxxxxxxx",  // Your API key
  "prompt": "Your prompt here",        // The prompt to generate a response for
  "options": {                         // Optional parameters
    "model": "openai/gpt-4",           // AI model to use
    "max_tokens": 500,                 // Maximum tokens in the response
    "temperature": 0.7,                // Randomness of the response (0-1)
    "top_p": 1,                        // Nucleus sampling parameter
    "stop": ["\\n", "User:"]           // Sequences where the API will stop generating
  }
}`}
                  </code>
                </div>
                
                <h4 className="font-bold mb-2">Response</h4>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <code className="text-sm">
                    {`{
  "id": "resp-xxxxxxxxxxxxxxxx",       // Response ID
  "response": "Generated text here",   // The generated response
  "model": "openai/gpt-4",            // Model used for generation
  "tokens_used": 125,                 // Number of tokens used
  "created_at": "2025-09-26T10:15:30Z" // Timestamp
}`}
                  </code>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">GET</span>
                <code className="text-lg font-mono">/api/models</code>
              </div>
              <p className="text-gray-600 mb-4">
                Get a list of available AI models.
              </p>
              
              <div className="mt-6">
                <h4 className="font-bold mb-2">Request Parameters</h4>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <code className="text-sm">
                    {`{
  "api_key": "ctrl-xxxxxxxxxxxxxxxx"  // Your API key (as query parameter)
}`}
                  </code>
                </div>
                
                <h4 className="font-bold mb-2">Response</h4>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <code className="text-sm">
                    {`{
  "models": [
    {
      "id": "openai/gpt-4",
      "name": "GPT-4",
      "provider": "OpenAI",
      "max_tokens": 8192,
      "pricing": {
        "input": 0.03,
        "output": 0.06
      }
    },
    {
      "id": "openai/gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "provider": "OpenAI",
      "max_tokens": 4096,
      "pricing": {
        "input": 0.0015,
        "output": 0.002
      }
    },
    // More models...
  ]
}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rate Limits */}
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
            <div className="flex items-start mb-4">
              <div className="bg-black rounded-full p-3 mr-4">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Rate Limits</h3>
                <p className="text-gray-600 mb-4">
                  API rate limits vary based on your subscription plan:
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests per Minute</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Token Quota</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Free</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10,000</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pro</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">60</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,000,000</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pay-as-you-go</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Unlimited (billed per use)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error Handling */}
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
            <div className="flex items-start mb-4">
              <div className="bg-black rounded-full p-3 mr-4">
                <AlertCircle className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Error Handling</h3>
                <p className="text-gray-600 mb-4">
                  The API uses standard HTTP response codes to indicate the success or failure of requests.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">200 - OK</td>
                        <td className="px-6 py-4 text-sm text-gray-500">The request was successful.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">400 - Bad Request</td>
                        <td className="px-6 py-4 text-sm text-gray-500">The request was invalid or missing required parameters.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">401 - Unauthorized</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Invalid or missing API key.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">403 - Forbidden</td>
                        <td className="px-6 py-4 text-sm text-gray-500">The API key doesn't have permission to perform the request.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">429 - Too Many Requests</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Rate limit exceeded.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">500 - Server Error</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Something went wrong on our end.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* SDKs */}
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
            <div className="flex items-start mb-4">
              <div className="bg-black rounded-full p-3 mr-4">
                <Code className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">SDKs</h3>
                <p className="text-gray-600 mb-4">
                  We provide official SDKs for several programming languages to make integration easier:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a href="/docs/sdk/javascript" className="block p-4 border border-gray-200 rounded-lg hover:border-black transition-colors">
                    <h4 className="font-bold">JavaScript/TypeScript</h4>
                    <p className="text-sm text-gray-500">npm install @control-ai/sdk</p>
                  </a>
                  <a href="/docs/sdk/python" className="block p-4 border border-gray-200 rounded-lg hover:border-black transition-colors">
                    <h4 className="font-bold">Python</h4>
                    <p className="text-sm text-gray-500">pip install control-ai-sdk</p>
                  </a>
                  <a href="/docs/sdk/ruby" className="block p-4 border border-gray-200 rounded-lg hover:border-black transition-colors">
                    <h4 className="font-bold">Ruby</h4>
                    <p className="text-sm text-gray-500">gem install control-ai-sdk</p>
                  </a>
                  <a href="/docs/sdk/go" className="block p-4 border border-gray-200 rounded-lg hover:border-black transition-colors">
                    <h4 className="font-bold">Go</h4>
                    <p className="text-sm text-gray-500">go get github.com/control-ai/sdk-go</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Support */}
        <section className="py-12 max-w-4xl mx-auto">
          <div className="bg-black text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="mb-6">
              Our support team is ready to assist you with any questions or issues you may have.
            </p>
            <Link href="/contact" className="inline-flex items-center btn bg-white text-black hover:bg-gray-100">
              <Mail className="mr-2" size={18} />
              Contact Support
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}