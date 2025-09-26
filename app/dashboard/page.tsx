'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Key, 
  BarChart3, 
  CreditCard, 
  Settings, 
  User, 
  Plus, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertTriangle,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/client';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// Sample data for charts
const usageData = [
  { date: '2023-09-20', tokens: 1200 },
  { date: '2023-09-21', tokens: 1800 },
  { date: '2023-09-22', tokens: 1400 },
  { date: '2023-09-23', tokens: 2200 },
  { date: '2023-09-24', tokens: 1900 },
  { date: '2023-09-25', tokens: 2400 },
  { date: '2023-09-26', tokens: 2100 },
];

const modelUsageData = [
  { name: 'GPT-3.5', value: 65 },
  { name: 'GPT-4', value: 30 },
  { name: 'Claude', value: 5 },
];

// Sample API keys
const initialApiKeys = [
  {
    id: 'ctrl-abcdefghijklmn',
    name: 'Production API Key',
    tier: 'pro',
    created: '2023-08-15',
    lastUsed: '2023-09-26',
    status: 'active',
  },
  {
    id: 'ctrl-opqrstuvwxyzab',
    name: 'Development API Key',
    tier: 'free',
    created: '2023-09-01',
    lastUsed: '2023-09-25',
    status: 'active',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyTier, setNewKeyTier] = useState('free');
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.error('No user data found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Copy API key to clipboard
  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Create new API key
  const handleCreateKey = () => {
    if (!newKeyName) return;
    
    // In a real app, this would call your API to create a new key
    const newKey = {
      id: `ctrl-${Math.random().toString(36).substring(2, 10)}`,
      name: newKeyName,
      tier: newKeyTier,
      created: new Date().toISOString().split('T')[0],
      lastUsed: '-',
      status: 'active',
    };
    
    setApiKeys([...apiKeys, newKey]);
    setIsCreatingKey(false);
    setNewKeyName('');
    setNewKeyTier('free');
  };

  // Revoke API key
  const revokeKey = (keyId: string) => {
    // In a real app, this would call your API to revoke the key
    setApiKeys(apiKeys.map(key => 
      key.id === keyId ? { ...key, status: 'revoked' } : key
    ));
  };

  // Delete API key
  const deleteKey = (keyId: string) => {
    // In a real app, this would call your API to delete the key
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">There was an error authenticating your account.</p>
          <Link href="/login" className="btn btn-primary">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Dashboard Header */}
      <header className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-300">
                Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm text-gray-300">Current Plan</p>
                <p className="font-bold">{userData?.plan || 'Free'}</p>
              </div>
              <Link 
                href="/pricing" 
                className="btn bg-white text-black hover:bg-gray-100"
              >
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === 'overview'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === 'api-keys'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('api-keys')}
            >
              API Keys
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === 'usage'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('usage')}
            >
              Usage
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === 'billing'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('billing')}
            >
              Billing
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === 'settings'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">API Calls (30d)</h3>
                  <BarChart3 className="text-gray-400" size={20} />
                </div>
                <p className="text-3xl font-bold">1,248</p>
                <p className="text-sm text-green-600 mt-2">+12.5% from last month</p>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">Tokens Used (30d)</h3>
                  <BarChart3 className="text-gray-400" size={20} />
                </div>
                <p className="text-3xl font-bold">42,580</p>
                <p className="text-sm text-green-600 mt-2">+8.3% from last month</p>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">Active API Keys</h3>
                  <Key className="text-gray-400" size={20} />
                </div>
                <p className="text-3xl font-bold">{apiKeys.filter(key => key.status === 'active').length}</p>
                <p className="text-sm text-gray-500 mt-2">Last created on {apiKeys[0].created}</p>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">Token Balance</h3>
                  <CreditCard className="text-gray-400" size={20} />
                </div>
                <p className="text-3xl font-bold">{userData?.token_balance || 0}</p>
                <Link href="/dashboard/billing" className="text-sm text-accent hover:underline mt-2 inline-block">
                  Buy more tokens
                </Link>
              </motion.div>
            </div>
            
            {/* Usage Chart */}
            <motion.div 
              className="bg-white rounded-2xl shadow-soft p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h3 className="text-lg font-bold mb-6">Token Usage (Last 7 Days)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={usageData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} tokens`, 'Usage']}
                      labelFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.toLocaleDateString()}`;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tokens" 
                      stroke="#000000" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            
            {/* Quick Actions and Recent API Keys */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    className="p-4 border border-gray-200 rounded-xl hover:border-black transition-colors flex flex-col items-center justify-center text-center"
                    onClick={() => setActiveTab('api-keys')}
                  >
                    <Key className="mb-2" size={24} />
                    <span>Create API Key</span>
                  </button>
                  <Link 
                    href="/dashboard/billing/buy"
                    className="p-4 border border-gray-200 rounded-xl hover:border-black transition-colors flex flex-col items-center justify-center text-center"
                  >
                    <CreditCard className="mb-2" size={24} />
                    <span>Buy Token Pack</span>
                  </Link>
                  <Link 
                    href="/docs/api"
                    className="p-4 border border-gray-200 rounded-xl hover:border-black transition-colors flex flex-col items-center justify-center text-center"
                  >
                    <ExternalLink className="mb-2" size={24} />
                    <span>API Documentation</span>
                  </Link>
                  <Link 
                    href="/contact"
                    className="p-4 border border-gray-200 rounded-xl hover:border-black transition-colors flex flex-col items-center justify-center text-center"
                  >
                    <User className="mb-2" size={24} />
                    <span>Contact Support</span>
                  </Link>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Your API Keys</h3>
                  <button 
                    className="text-sm text-accent hover:underline"
                    onClick={() => setActiveTab('api-keys')}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {apiKeys.slice(0, 3).map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="text-sm text-gray-500 font-mono">{key.id}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {key.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">API Keys</h2>
              <button 
                className="btn btn-primary flex items-center"
                onClick={() => setIsCreatingKey(true)}
              >
                <Plus className="mr-2" size={18} />
                Create New Key
              </button>
            </div>
            
            {/* Create Key Form */}
            {isCreatingKey && (
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6 mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-bold mb-4">Create New API Key</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="key-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Key Name
                    </label>
                    <input
                      type="text"
                      id="key-name"
                      className="form-input"
                      placeholder="e.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="key-tier" className="block text-sm font-medium text-gray-700 mb-1">
                      Tier
                    </label>
                    <select
                      id="key-tier"
                      className="form-input"
                      value={newKeyTier}
                      onChange={(e) => setNewKeyTier(e.target.value)}
                    >
                      <option value="free">Free</option>
                      <option value="pro">Professional</option>
                      <option value="payg">Pay As You Go</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button 
                      className="btn bg-white border border-gray-300 hover:bg-gray-50"
                      onClick={() => setIsCreatingKey(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleCreateKey}
                      disabled={!newKeyName}
                    >
                      Create Key
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* API Keys List */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        API Key
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Used
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{key.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <code className="text-sm font-mono text-gray-900">{key.id}</code>
                            <button 
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              onClick={() => copyToClipboard(key.id)}
                              aria-label="Copy API key"
                            >
                              {copiedKey === key.id ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{key.tier}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{key.created}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{key.lastUsed}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            key.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {key.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {key.status === 'active' ? (
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => revokeKey(key.id)}
                                aria-label="Revoke API key"
                              >
                                <RefreshCw size={16} />
                              </button>
                            ) : (
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => deleteKey(key.id)}
                                aria-label="Delete API key"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Usage Analytics</h2>
            
            {/* Time Period Selector */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Token Usage</h3>
                <div className="inline-flex rounded-md shadow-sm mt-2 sm:mt-0">
                  <button className="px-4 py-2 text-sm font-medium rounded-l-md bg-black text-white">
                    7 Days
                  </button>
                  <button className="px-4 py-2 text-sm font-medium border-y border-r border-gray-300">
                    30 Days
                  </button>
                  <button className="px-4 py-2 text-sm font-medium rounded-r-md border-y border-r border-gray-300">
                    90 Days
                  </button>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={usageData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} tokens`, 'Usage']}
                      labelFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.toLocaleDateString()}`;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tokens" 
                      stroke="#000000" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Usage Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-bold mb-6">Usage by Model</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={modelUsageData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                      <Bar dataKey="value" fill="#000000" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-bold mb-6">Usage by API Key</h3>
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center">
                      <div className="w-1/3">
                        <p className="text-sm font-medium truncate">{key.name}</p>
                      </div>
                      <div className="w-2/3 pl-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-black h-2 rounded-full" 
                              style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-4 text-sm text-gray-500">
                            {Math.floor(Math.random() * 10000)} tokens
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Usage Table */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold">Recent API Calls</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        API Key
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tokens
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(Date.now() - i * 3600000).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {apiKeys[i % apiKeys.length].id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">/api/ai</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {Math.floor(Math.random() * 500) + 100}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-200 text-center">
                <button className="text-sm text-accent hover:underline">
                  View All API Calls
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Billing & Subscription</h2>
            
            {/* Current Plan */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">Current Plan</h3>
                  <p className="text-gray-600 mb-4 md:mb-0">
                    You are currently on the <span className="font-medium">{userData?.plan || 'Free'}</span> plan.
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Link href="/pricing" className="btn bg-white border border-black text-black hover:bg-gray-100">
                    View Plans
                  </Link>
                  <Link href="/dashboard/billing/upgrade" className="btn btn-primary">
                    Upgrade
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Token Packs */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
              <h3 className="text-lg font-bold mb-6">Token Packs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-xl p-6 hover:border-black transition-colors">
                  <h4 className="font-bold text-xl mb-2">Starter Pack</h4>
                  <p className="text-gray-600 mb-4">100,000 tokens</p>
                  <p className="text-3xl font-bold mb-6">$9.99</p>
                  <Link 
                    href="/dashboard/billing/buy?pack=starter"
                    className="block w-full py-2 text-center rounded-xl bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    Buy Now
                  </Link>
                </div>
                
                <div className="border-2 border-black rounded-xl p-6 relative">
                  <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    Best Value
                  </div>
                  <h4 className="font-bold text-xl mb-2">Pro Pack</h4>
                  <p className="text-gray-600 mb-4">500,000 tokens</p>
                  <p className="text-3xl font-bold mb-6">$39.99</p>
                  <Link 
                    href="/dashboard/billing/buy?pack=pro"
                    className="block w-full py-2 text-center rounded-xl bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    Buy Now
                  </Link>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-6 hover:border-black transition-colors">
                  <h4 className="font-bold text-xl mb-2">Enterprise Pack</h4>
                  <p className="text-gray-600 mb-4">2,000,000 tokens</p>
                  <p className="text-3xl font-bold mb-6">$149.99</p>
                  <Link 
                    href="/dashboard/billing/buy?pack=enterprise"
                    className="block w-full py-2 text-center rounded-xl bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Payment Methods</h3>
                <button className="text-sm text-accent hover:underline">
                  Add Payment Method
                </button>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gray-100 rounded-lg p-2 mr-4">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/25</p>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Default
                  </span>
                </div>
              </div>
            </div>
            
            {/* Billing History */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold">Billing History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Sep 15, 2023</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Pro Plan Subscription</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">$49.99</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-accent hover:underline">
                          Download
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Aug 15, 2023</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Pro Plan Subscription</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">$49.99</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-accent hover:underline">
                          Download
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Aug 10, 2023</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Pro Token Pack</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">$39.99</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-accent hover:underline">
                          Download
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            
            {/* Profile Settings */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
              <h3 className="text-lg font-bold mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="form-input"
                      defaultValue={user?.displayName || ''}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-input"
                      defaultValue={user?.email || ''}
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="form-input"
                    defaultValue=""
                    placeholder="Your company name"
                  />
                </div>
                <div className="flex justify-end">
                  <button className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
            
            {/* Password Settings */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
              <h3 className="text-lg font-bold mb-6">Change Password</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    className="form-input"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      className="form-input"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      className="form-input"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="btn btn-primary">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
            
            {/* API Settings */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
              <h3 className="text-lg font-bold mb-6">API Settings</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="webhook-url"
                    className="form-input"
                    placeholder="https://example.com/webhook"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    We'll send API usage events to this URL.
                  </p>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-black focus:ring-black"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable email notifications for API errors
                    </span>
                  </label>
                </div>
                <div className="flex justify-end">
                  <button className="btn btn-primary">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
            
            {/* Danger Zone */}
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-red-200">
              <h3 className="text-lg font-bold text-red-600 mb-6">Danger Zone</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Delete Account</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}