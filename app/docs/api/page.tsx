'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Terminal, Key, Shield, Clock, AlertCircle, Code } from 'lucide-react';
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
      max_tokens: 1000,
      temperature: 0.7
    }
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`,

  python: `# Using requests library
import requests
import json

response = requests.post(
    'https://api.control.ai/api/ai',
    headers={'Content-Type': 'application/json'},
    json={
        'api_key': 'ctrl-xxxxxxxxxxxxxxxx',
        'prompt': 'Explain how to use the Control API',
        'options': {
            'model': 'openai/gpt-4',
            'max_tokens': 1000,
            'temperature': 0.7
        }
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])`,

  curl: `curl -X POST https://api.control.ai/api/ai \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "ctrl-xxxxxxxxxxxxxxxx",
    "prompt": "Explain how to use the Control API",
    "options": {
      "model": "openai/gpt-4",
      "max_tokens": 1000,
      "temperature": 0.7
    }
  }'`,

  node: `// Using Node.js with axios
const axios = require('axios');

async function callControlAPI() {
  try {
    const response = await axios.post('https://api.control.ai/api/ai', {
      api_key: 'ctrl-xxxxxxxxxxxxxxxx',
      prompt: 'Explain how to use the Control API',
      options: {
        model: 'openai/gpt-4',
        max_tokens: 1000,
        temperature: 0.7
      }
    });
    
    console.log(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error calling Control API:', error);
  }
}

callControlAPI();`,
};

// Error codes
const errorCodes = [
  { code: 400, message: 'Bad Request', description: 'The request was malformed or missing required parameters.' },
  { code: 401, message: 'Unauthorized', description: 'Invalid API key or the key has been revoked.' },
  { code: 403, message: 'Forbidden', description: 'Monthly token quota exceeded or insufficient permissions.' },
  { code: 429, message: 'Too Many Requests', description: 'Rate limit exceeded. Try again after the rate limit resets.' },
  { code: 500, message: 'Internal Server Error', description: 'An error occurred on our servers. Please try again later.' },
  { code: 503, message: 'Service Unavailable', description: 'No healthy OpenRouter keys available or the service is temporarily down.' },
];

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'javascript' | 'python' | 'curl' | 'node'>('javascript');
  const [copied, setCopied] = useState(false);

  // Copy code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="container mx-auto px-4 mb-16">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Control API Documentation
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Integrate Control's AI capabilities into your applications with our simple and powerful API.
        </motion.p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Contents</h2>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <a href="#introduction" className="block py-1 hover:text-accent transition-colors">
                      Introduction
                    </a>
                  </li>
                  <li>
                    <a href="#authentication" className="block py-1 hover:text-accent transition-colors">
                      Authentication
                    </a>
                  </li>
                  <li>
                    <a href="#endpoints" className="block py-1 hover:text-accent transition-colors">
                      API Endpoints
                    </a>
                    <ul className="pl-4 mt-1 space-y-1">
                      <li>
                        <a href="#ai-endpoint" className="block py-1 text-sm hover:text-accent transition-colors">
                          POST /api/ai
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#rate-limits" className="block py-1 hover:text-accent transition-colors">
                      Rate Limits
                    </a>
                  </li>
                  <li>
                    <a href="#error-codes" className="block py-1 hover:text-accent transition-colors">
                      Error Codes
                    </a>
                  </li>
                  <li>
                    <a href="#examples" className="block py-1 hover:text-accent transition-colors">
                      Code Examples
                    </a>
                  </li>
                  <li>
                    <a href="#sdks" className="block py-1 hover:text-accent transition-colors">
                      SDKs & Libraries
                    </a>
                  </li>
                </ul>
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link
                  href="/dashboard"
                  className="block w-full py-2 text-center rounded-xl bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Get API Key
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Documentation Content */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Introduction */}
            <section id="introduction" className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Introduction</h2>
              <div className="prose max-w-none">
                <p className="text-lg">
                  The Control API provides programmatic access to Control's AI capabilities, allowing you to integrate advanced natural language processing into your applications.
                </p>
                <p>
                  Our API is designed to be simple to use while providing powerful features. You can use it to:
                </p>
                <ul>
                  <li>Generate text responses based on prompts</li>
                  <li>Access different AI models including GPT-3.5 and GPT-4</li>
                  <li>Customize response parameters like temperature and token limits</li>
                  <li>Build AI-powered features into your applications</li>
                </ul>
                <p>
                  The API is RESTful and returns responses in JSON format, making it easy to integrate with any programming language or framework.
                </p>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Authentication</h2>
              <div className="prose max-w-none">
                <p>
                  All API requests require an API key for authentication. You can generate an API key from your <Link href="/dashboard" className="text-accent hover:underline">dashboard</Link>.
                </p>
                <p>
                  Your API key should be included in the request body as the <code>api_key</code> parameter:
                </p>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <pre className="font-mono text-sm overflow-x-auto">
                    {`{
  "api_key": "ctrl-xxxxxxxxxxxxxxxx",
  "prompt": "Your prompt here"
}`}
                  </pre>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                  <div className="flex">
                    <AlertCircle className="text-yellow-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-700">Important</p>
                      <p className="text-yellow-600">
                        Keep your API key secure and never expose it in client-side code. If you suspect your API key has been compromised, you can regenerate it from your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* API Endpoints */}
            <section id="endpoints" className="mb-12">
              <h2 className="text-3xl font-bold mb-4">API Endpoints</h2>
              
              <div id="ai-endpoint" className="mb-8">
                <h3 className="text-2xl font-bold mb-4">POST /api/ai</h3>
                <div className="prose max-w-none">
                  <p>
                    This endpoint allows you to send a prompt to the AI and receive a generated response.
                  </p>
                  
                  <h4>Request Parameters</h4>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Parameter</th>
                        <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Type</th>
                        <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Required</th>
                        <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">api_key</td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">Yes</td>
                        <td className="border border-gray-300 px-4 py-2">Your API key</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">prompt</td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">Yes</td>
                        <td className="border border-gray-300 px-4 py-2">The prompt to send to the AI</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">options</td>
                        <td className="border border-gray-300 px-4 py-2">object</td>
                        <td className="border border-gray-300 px-4 py-2">No</td>
                        <td className="border border-gray-300 px-4 py-2">Additional options for the request</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <h4>Options Object</h4>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Parameter</th>
                        <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Type</th>
                        <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Default</th>
                        <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">model</td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">Tier default</td>
                        <td className="border border-gray-300 px-4 py-2">The AI model to use (e.g., "openai/gpt-4")</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">max_tokens</td>
                        <td className="border border-gray-300 px-4 py-2">integer</td>
                        <td className="border border-gray-300 px-4 py-2">1000</td>
                        <td className="border border-gray-300 px-4 py-2">Maximum number of tokens to generate</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">temperature</td>
                        <td className="border border-gray-300 px-4 py-2">number</td>
                        <td className="border border-gray-300 px-4 py-2">0.7</td>
                        <td className="border border-gray-300 px-4 py-2">Controls randomness (0-1)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">top_p</td>
                        <td className="border border-gray-300 px-4 py-2">number</td>
                        <td className="border border-gray-300 px-4 py-2">1</td>
                        <td className="border border-gray-300 px-4 py-2">Controls diversity via nucleus sampling</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">stream</td>
                        <td className="border border-gray-300 px-4 py-2">boolean</td>
                        <td className="border border-gray-300 px-4 py-2">false</td>
                        <td className="border border-gray-300 px-4 py-2">Whether to stream the response</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">stop</td>
                        <td className="border border-gray-300 px-4 py-2">array</td>
                        <td className="border border-gray-300 px-4 py-2">[]</td>
                        <td className="border border-gray-300 px-4 py-2">Sequences where the API will stop generating</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <h4>Example Request</h4>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <pre className="font-mono text-sm overflow-x-auto">
                      {`POST /api/ai
Content-Type: application/json

{
  "api_key": "ctrl-xxxxxxxxxxxxxxxx",
  "prompt": "Explain how to use the Control API",
  "options": {
    "model": "openai/gpt-4",
    "max_tokens": 1000,
    "temperature": 0.7
  }
}`}
                    </pre>
                  </div>
                  
                  <h4>Example Response</h4>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <pre className="font-mono text-sm overflow-x-auto">
                      {`{
  "id": "response-id",
  "object": "chat.completion",
  "created": 1625097600,
  "model": "openai/gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The Control API is designed to be simple yet powerful..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 150,
    "total_tokens": 160
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits" className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Rate Limits</h2>
              <div className="prose max-w-none">
                <p>
                  Rate limits vary based on your subscription tier:
                </p>
                
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Plan</th>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Requests per Minute</th>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Monthly Token Quota</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Free</td>
                      <td className="border border-gray-300 px-4 py-2">10</td>
                      <td className="border border-gray-300 px-4 py-2">10,000</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Professional</td>
                      <td className="border border-gray-300 px-4 py-2">60</td>
                      <td className="border border-gray-300 px-4 py-2">1,000,000</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Pay As You Go</td>
                      <td className="border border-gray-300 px-4 py-2">30</td>
                      <td className="border border-gray-300 px-4 py-2">Unlimited (pay per use)</td>
                    </tr>
                  </tbody>
                </table>
                
                <p>
                  When you exceed your rate limit, the API will return a 429 error with information about when you can retry.
                </p>
                
                <p>
                  Rate limit headers are included in all API responses:
                </p>
                
                <ul>
                  <li><code>X-RateLimit-Limit</code>: Your rate limit (requests per minute)</li>
                  <li><code>X-RateLimit-Remaining</code>: The number of requests remaining in the current window</li>
                  <li><code>X-RateLimit-Reset</code>: The time at which the rate limit resets (Unix timestamp)</li>
                </ul>
              </div>
            </section>

            {/* Error Codes */}
            <section id="error-codes" className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Error Codes</h2>
              <div className="prose max-w-none">
                <p>
                  The API uses standard HTTP status codes to indicate the success or failure of a request.
                </p>
                
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Code</th>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorCodes.map((error) => (
                      <tr key={error.code}>
                        <td className="border border-gray-300 px-4 py-2">{error.code}</td>
                        <td className="border border-gray-300 px-4 py-2">{error.message}</td>
                        <td className="border border-gray-300 px-4 py-2">{error.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <p>
                  Error responses include a JSON object with more details:
                </p>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <pre className="font-mono text-sm overflow-x-auto">
                    {`{
  "error": "Rate limit exceeded",
  "limit": 10,
  "reset_at": "2023-09-26T08:34:41Z"
}`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Code Examples */}
            <section id="examples" className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Code Examples</h2>
              
              {/* Language Tabs */}
              <div className="mb-4 border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {(['javascript', 'python', 'curl', 'node'] as const).map((lang) => (
                    <button
                      key={lang}
                      className={`px-4 py-2 font-medium text-sm ${
                        activeTab === lang
                          ? 'border-b-2 border-black text-black'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                      onClick={() => setActiveTab(lang)}
                    >
                      {lang === 'javascript' ? 'JavaScript' : 
                       lang === 'python' ? 'Python' : 
                       lang === 'curl' ? 'cURL' : 'Node.js'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Code Block */}
              <div className="relative">
                <div className="bg-gray-900 rounded-xl p-4 overflow-hidden">
                  <button
                    onClick={() => copyToClipboard(codeExamples[activeTab])}
                    className="absolute top-4 right-4 p-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                    aria-label="Copy code"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                  <pre className="font-mono text-sm text-gray-200 overflow-x-auto">
                    {codeExamples[activeTab]}
                  </pre>
                </div>
              </div>
            </section>

            {/* SDKs & Libraries */}
            <section id="sdks" className="mb-12">
              <h2 className="text-3xl font-bold mb-4">SDKs & Libraries</h2>
              <div className="prose max-w-none">
                <p>
                  We provide official client libraries for several programming languages to make integrating with the Control API even easier.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <a href="https://github.com/control-ai/control-node" className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-black transition-colors">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-black rounded-full mr-4">
                        <Code className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Node.js SDK</h3>
                        <p className="text-sm text-gray-600">npm install @control/api</p>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Official Node.js client for the Control API with TypeScript support.
                    </p>
                  </a>
                  
                  <a href="https://github.com/control-ai/control-python" className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-black transition-colors">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-black rounded-full mr-4">
                        <Code className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold">Python SDK</h3>
                        <p className="text-sm text-gray-600">pip install control-api</p>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Official Python client for the Control API with async support.
                    </p>
                  </a>
                </div>
                
                <p className="mt-6">
                  Community-maintained libraries:
                </p>
                
                <ul>
                  <li><a href="#" className="text-accent hover:underline">control-go</a> - Go client library</li>
                  <li><a href="#" className="text-accent hover:underline">control-ruby</a> - Ruby client library</li>
                  <li><a href="#" className="text-accent hover:underline">control-php</a> - PHP client library</li>
                </ul>
                
                <p>
                  Want to contribute? Check out our <a href="https://github.com/control-ai" className="text-accent hover:underline">GitHub repositories</a> to get started.
                </p>
              </div>
            </section>

            {/* Support */}
            <section className="mb-12">
              <div className="bg-gray-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
                <p className="mb-6">
                  If you have any questions or need assistance with the API, we're here to help.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Mail className="mr-2" size={18} />
                    Contact Support
                  </Link>
                  <Link
                    href="/community"
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-white border border-black text-black font-medium hover:bg-gray-100 transition-colors"
                  >
                    Community Forum
                  </Link>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  );
}