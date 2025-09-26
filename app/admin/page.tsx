'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Users, 
  Key, 
  Server, 
  BarChart3, 
  Settings, 
  AlertTriangle, 
  Check, 
  X, 
  Plus,
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  Filter,
  Trash2,
  Edit,
  Eye,
  Clock
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import ParticleBackground from '@/components/ui/ParticleBackground';

// Sample data for charts
const requestsData = [
  { hour: '00:00', requests: 120 },
  { hour: '01:00', requests: 80 },
  { hour: '02:00', requests: 60 },
  { hour: '03:00', requests: 40 },
  { hour: '04:00', requests: 30 },
  { hour: '05:00', requests: 50 },
  { hour: '06:00', requests: 70 },
  { hour: '07:00', requests: 90 },
  { hour: '08:00', requests: 150 },
  { hour: '09:00', requests: 220 },
  { hour: '10:00', requests: 280 },
  { hour: '11:00', requests: 350 },
  { hour: '12:00', requests: 380 },
  { hour: '13:00', requests: 410 },
  { hour: '14:00', requests: 430 },
  { hour: '15:00', requests: 450 },
  { hour: '16:00', requests: 420 },
  { hour: '17:00', requests: 390 },
  { hour: '18:00', requests: 340 },
  { hour: '19:00', requests: 290 },
  { hour: '20:00', requests: 240 },
  { hour: '21:00', requests: 200 },
  { hour: '22:00', requests: 160 },
  { hour: '23:00', requests: 140 },
];

const tierUsageData = [
  { name: 'Free', value: 35 },
  { name: 'Pro', value: 45 },
  { name: 'Pay-as-you-go', value: 20 },
];

const COLORS = ['#0088FE', '#000000', '#FFBB28'];

// Sample API keys
const apiKeys = [
  {
    id: 'ctrl-abcdefghijklmn',
    name: 'Production API Key',
    owner: 'john@example.com',
    tier: 'pro',
    created: '2023-08-15',
    lastUsed: '2023-09-26',
    usage: 245000,
    quota: 1000000,
    status: 'active',
  },
  {
    id: 'ctrl-opqrstuvwxyzab',
    name: 'Development API Key',
    owner: 'sarah@example.com',
    tier: 'free',
    created: '2023-09-01',
    lastUsed: '2023-09-25',
    usage: 8500,
    quota: 10000,
    status: 'active',
  },
  {
    id: 'ctrl-cdefghijklmnop',
    name: 'Testing API Key',
    owner: 'mike@example.com',
    tier: 'payg',
    created: '2023-09-10',
    lastUsed: '2023-09-24',
    usage: 12500,
    quota: 0,
    status: 'active',
  },
  {
    id: 'ctrl-qrstuvwxyzabcd',
    name: 'Revoked API Key',
    owner: 'alex@example.com',
    tier: 'free',
    created: '2023-07-20',
    lastUsed: '2023-09-15',
    usage: 9800,
    quota: 10000,
    status: 'revoked',
  },
];

// Sample OpenRouter keys
const openRouterKeys = [
  {
    id: '1',
    env_name: 'OPENROUTER_KEY_1',
    notes: 'Primary production key',
    status: 'healthy',
    concurrent: 3,
    last_checked: '2023-09-26 08:15:22',
  },
  {
    id: '2',
    env_name: 'OPENROUTER_KEY_2',
    notes: 'Backup key',
    status: 'healthy',
    concurrent: 1,
    last_checked: '2023-09-26 08:15:22',
  },
  {
    id: '3',
    env_name: 'OPENROUTER_KEY_3',
    notes: 'Development key',
    status: 'rate_limited',
    concurrent: 0,
    last_checked: '2023-09-26 08:15:22',
  },
  {
    id: '4',
    env_name: 'OPENROUTER_KEY_4',
    notes: 'Testing key',
    status: 'unhealthy',
    concurrent: 0,
    last_checked: '2023-09-26 08:15:22',
  },
];

// Sample usage logs
const usageLogs = [
  {
    id: 'log-1',
    timestamp: '2023-09-26 08:14:22',
    api_key: 'ctrl-abcdefghijklmn',
    endpoint: '/api/ai',
    tokens_used: 245,
    success: true,
    openrouter_key_used: '1',
  },
  {
    id: 'log-2',
    timestamp: '2023-09-26 08:13:45',
    api_key: 'ctrl-opqrstuvwxyzab',
    endpoint: '/api/ai',
    tokens_used: 128,
    success: true,
    openrouter_key_used: '2',
  },
  {
    id: 'log-3',
    timestamp: '2023-09-26 08:12:30',
    api_key: 'ctrl-cdefghijklmnop',
    endpoint: '/api/ai',
    tokens_used: 0,
    success: false,
    error_code: 'rate_limited',
    openrouter_key_used: '3',
  },
  {
    id: 'log-4',
    timestamp: '2023-09-26 08:11:15',
    api_key: 'ctrl-abcdefghijklmn',
    endpoint: '/api/ai',
    tokens_used: 312,
    success: true,
    openrouter_key_used: '1',
  },
  {
    id: 'log-5',
    timestamp: '2023-09-26 08:10:05',
    api_key: 'ctrl-opqrstuvwxyzab',
    endpoint: '/api/ai',
    tokens_used: 0,
    success: false,
    error_code: 'invalid_request',
    openrouter_key_used: null,
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingOpenRouterKey, setIsAddingOpenRouterKey] = useState(false);
  const [isAddingApiKey, setIsAddingApiKey] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            // Not an admin, redirect to dashboard
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          router.push('/dashboard');
        }
      }
    };

    if (!loading) {
      if (user) {
        checkAdminStatus();
      } else {
        // Not logged in, redirect to login
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Filter API keys based on search query and status filter
  const filteredApiKeys = apiKeys.filter(key => {
    const matchesSearch = 
      key.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      key.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Loading state
  if (loading || !isAdmin) {
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
      {/* Admin Dashboard Header */}
      <header className="bg-black text-white py-8 relative overflow-hidden">
        {/* Particle effect in header */}
        <div className="absolute inset-0 z-0">
          <ParticleBackground count={50} color="#ffffff" minSize={1} maxSize={2} speed={0.3} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-300">
                Manage API keys, monitor system health, and analyze usage
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <Link 
                href="/dashboard" 
                className="btn bg-white text-black hover:bg-gray-100"
              >
                Back to User Dashboard
              </Link>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <motion.div 
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-200 text-sm font-medium">Total Users</h3>
                <Users className="text-gray-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-white">1,248</p>
              <p className="text-sm text-green-400 mt-2">+12.5% from last month</p>
            </motion.div>
            
            <motion.div 
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-200 text-sm font-medium">Active API Keys</h3>
                <Key className="text-gray-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-white">{apiKeys.filter(key => key.status === 'active').length}</p>
              <p className="text-sm text-green-400 mt-2">+8.3% from last month</p>
            </motion.div>
            
            <motion.div 
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-200 text-sm font-medium">OpenRouter Keys</h3>
                <Server className="text-gray-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-white">{openRouterKeys.filter(key => key.status === 'healthy').length}/{openRouterKeys.length}</p>
              <p className="text-sm text-yellow-400 mt-2">1 rate limited, 1 unhealthy</p>
            </motion.div>
            
            <motion.div 
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-200 text-sm font-medium">Requests Today</h3>
                <BarChart3 className="text-gray-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-white">4,582</p>
              <p className="text-sm text-green-400 mt-2">+15.2% from yesterday</p>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
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
                activeTab === 'openrouter'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('openrouter')}
            >
              OpenRouter Keys
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === 'logs'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('logs')}
            >
              Logs
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

      {/* Admin Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Requests Chart */}
            <motion.div 
              className="bg-white rounded-2xl shadow-soft p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-lg font-bold mb-6">Requests per Hour (Last 24 Hours)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={requestsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 12 }}
                      interval={3}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} requests`, 'Requests']}
                      labelFormatter={(hour) => `Time: ${hour}`}
                    />
                    <Bar 
                      dataKey="requests" 
                      fill="#000000" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            
            {/* System Health and Usage Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h3 className="text-lg font-bold mb-6">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">API Service</span>
                    </div>
                    <span className="text-green-600">Operational</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Authentication Service</span>
                    </div>
                    <span className="text-green-600">Operational</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="font-medium">OpenRouter Integration</span>
                    </div>
                    <span className="text-yellow-600">Partial Outage</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Billing Service</span>
                    </div>
                    <span className="text-green-600">Operational</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="text-sm text-accent hover:underline flex items-center">
                    <RefreshCw size={16} className="mr-2" />
                    Refresh Status
                  </button>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h3 className="text-lg font-bold mb-6">Usage Distribution by Tier</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tierUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {tierUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
            
            {/* Recent Activity and OpenRouter Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Recent Activity</h3>
                  <button 
                    className="text-sm text-accent hover:underline"
                    onClick={() => setActiveTab('logs')}
                  >
                    View all logs
                  </button>
                </div>
                <div className="space-y-4">
                  {usageLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="flex items-start p-4 bg-gray-50 rounded-xl">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                        log.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {log.success ? <Check size={16} /> : <X size={16} />}
                      </div>
                      <div>
                        <p className="font-medium">{log.success ? 'Successful request' : `Failed request: ${log.error_code}`}</p>
                        <p className="text-sm text-gray-500">
                          API Key: <span className="font-mono">{log.api_key}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {log.timestamp} • {log.success ? `${log.tokens_used} tokens used` : 'No tokens used'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">OpenRouter Keys Status</h3>
                  <button 
                    className="text-sm text-accent hover:underline"
                    onClick={() => setActiveTab('openrouter')}
                  >
                    Manage keys
                  </button>
                </div>
                <div className="space-y-4">
                  {openRouterKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          key.status === 'healthy' ? 'bg-green-500' : 
                          key.status === 'rate_limited' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{key.env_name}</p>
                          <p className="text-sm text-gray-500">{key.notes}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          key.status === 'healthy' ? 'text-green-600' : 
                          key.status === 'rate_limited' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {key.status}
                        </p>
                        <p className="text-sm text-gray-500">
                          {key.concurrent} active requests
                        </p>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold">API Keys Management</h2>
              <button 
                className="btn btn-primary flex items-center mt-4 md:mt-0"
                onClick={() => setIsAddingApiKey(true)}
              >
                <Plus className="mr-2" size={18} />
                Create New Key
              </button>
            </div>
            
            {/* Create API Key Form */}
            {isAddingApiKey && (
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6 mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-bold mb-4">Create New API Key</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="key-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Key Name
                    </label>
                    <input
                      type="text"
                      id="key-name"
                      className="form-input"
                      placeholder="e.g., Production API Key"
                    />
                  </div>
                  <div>
                    <label htmlFor="key-owner" className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Email
                    </label>
                    <input
                      type="email"
                      id="key-owner"
                      className="form-input"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="key-tier" className="block text-sm font-medium text-gray-700 mb-1">
                      Tier
                    </label>
                    <select
                      id="key-tier"
                      className="form-input"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Professional</option>
                      <option value="payg">Pay As You Go</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="key-quota" className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Quota (Tokens)
                    </label>
                    <input
                      type="number"
                      id="key-quota"
                      className="form-input"
                      placeholder="10000"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button 
                    className="btn bg-white border border-gray-300 hover:bg-gray-50"
                    onClick={() => setIsAddingApiKey(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsAddingApiKey(false)}
                  >
                    Create Key
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="relative flex-grow md:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-10"
                    placeholder="Search by key ID, name, or owner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 text-gray-400 mr-2" />
                    <select
                      className="form-input"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="revoked">Revoked</option>
                    </select>
                  </div>
                  <button className="btn bg-white border border-gray-300 hover:bg-gray-50">
                    Export
                  </button>
                </div>
              </div>
            </div>
            
            {/* API Keys Table */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        API Key
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name / Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage / Quota
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
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
                    {filteredApiKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">{key.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{key.name}</div>
                          <div className="text-sm text-gray-500">{key.owner}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{key.tier}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {key.usage.toLocaleString()} / {key.quota > 0 ? key.quota.toLocaleString() : '∞'}
                          </div>
                          {key.quota > 0 && (
                            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  (key.usage / key.quota) > 0.9 ? 'bg-red-500' :
                                  (key.usage / key.quota) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                                }`} 
                                style={{ width: `${Math.min(100, (key.usage / key.quota) * 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{key.created}</div>
                          <div className="text-sm text-gray-500">Last used: {key.lastUsed}</div>
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
                            <button 
                              className="p-1 text-gray-400 hover:text-gray-600"
                              aria-label="View API key details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="p-1 text-gray-400 hover:text-gray-600"
                              aria-label="Edit API key"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="p-1 text-gray-400 hover:text-red-600"
                              aria-label={key.status === 'active' ? 'Revoke API key' : 'Delete API key'}
                            >
                              {key.status === 'active' ? <RefreshCw size={16} /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredApiKeys.length}</span> of <span className="font-medium">{filteredApiKeys.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OpenRouter Keys Tab */}
        {activeTab === 'openrouter' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold">OpenRouter Keys Management</h2>
              <button 
                className="btn btn-primary flex items-center mt-4 md:mt-0"
                onClick={() => setIsAddingOpenRouterKey(true)}
              >
                <Plus className="mr-2" size={18} />
                Add New Key
              </button>
            </div>
            
            {/* Add OpenRouter Key Form */}
            {isAddingOpenRouterKey && (
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6 mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-bold mb-4">Add New OpenRouter Key</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="key-id" className="block text-sm font-medium text-gray-700 mb-1">
                      Key ID
                    </label>
                    <input
                      type="text"
                      id="key-id"
                      className="form-input"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <label htmlFor="env-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Environment Variable Name
                    </label>
                    <input
                      type="text"
                      id="env-name"
                      className="form-input"
                      placeholder="e.g., OPENROUTER_KEY_5"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="key-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    id="key-notes"
                    className="form-input"
                    placeholder="e.g., Backup production key"
                  />
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-700">Important</p>
                      <p className="text-yellow-600">
                        Make sure to add the actual OpenRouter API key to your environment variables in Vercel or your hosting platform.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button 
                    className="btn bg-white border border-gray-300 hover:bg-gray-50"
                    onClick={() => setIsAddingOpenRouterKey(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsAddingOpenRouterKey(false)}
                  >
                    Add Key
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* OpenRouter Keys Table */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Environment Variable
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Concurrent Requests
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Checked
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {openRouterKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{key.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">{key.env_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{key.notes}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            key.status === 'healthy' ? 'bg-green-100 text-green-800' : 
                            key.status === 'rate_limited' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {key.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{key.concurrent}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{key.last_checked}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              className="p-1 text-gray-400 hover:text-gray-600"
                              aria-label="Check key health"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button 
                              className="p-1 text-gray-400 hover:text-gray-600"
                              aria-label="Edit key"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="p-1 text-gray-400 hover:text-red-600"
                              aria-label="Delete key"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Health Check Settings */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-bold mb-6">Health Check Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="check-interval" className="block text-sm font-medium text-gray-700 mb-1">
                    Check Interval (minutes)
                  </label>
                  <input
                    type="number"
                    id="check-interval"
                    className="form-input"
                    defaultValue="5"
                  />
                </div>
                <div>
                  <label htmlFor="unhealthy-threshold" className="block text-sm font-medium text-gray-700 mb-1">
                    Unhealthy Threshold (seconds)
                  </label>
                  <input
                    type="number"
                    id="unhealthy-threshold"
                    className="form-input"
                    defaultValue="60"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="rate-limit-threshold" className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limit Cooldown (seconds)
                  </label>
                  <input
                    type="number"
                    id="rate-limit-threshold"
                    className="form-input"
                    defaultValue="300"
                  />
                </div>
                <div>
                  <label htmlFor="routing-policy" className="block text-sm font-medium text-gray-700 mb-1">
                    Routing Policy
                  </label>
                  <select
                    id="routing-policy"
                    className="form-input"
                    defaultValue="round_robin"
                  >
                    <option value="round_robin">Round Robin</option>
                    <option value="least_load">Least Load</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn btn-primary">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Usage Analytics</h2>
            
            {/* Time Period Selector */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between mb-6">
                <h3 className="text-lg font-bold">API Usage</h3>
                <div className="inline-flex rounded-md shadow-sm mt-2 sm:mt-0">
                  <button className="px-4 py-2 text-sm font-medium rounded-l-md bg-black text-white">
                    24 Hours
                  </button>
                  <button className="px-4 py-2 text-sm font-medium border-y border-r border-gray-300">
                    7 Days
                  </button>
                  <button className="px-4 py-2 text-sm font-medium border-y border-r border-gray-300">
                    30 Days
                  </button>
                  <button className="px-4 py-2 text-sm font-medium rounded-r-md border-y border-r border-gray-300">
                    Custom
                  </button>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={requestsData.map(item => ({ hour: item.hour, requests: item.requests * 2 }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 12 }}
                      interval={3}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} tokens`, 'Usage']}
                      labelFormatter={(hour) => `Time: ${hour}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="#000000" 
                      strokeWidth={2} 
                      dot={{ r: 3 }}
                      name="Tokens"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">Total Requests</h3>
                  <BarChart3 className="text-gray-400" size={20} />
                </div>
                <p className="text-3xl font-bold">124,582</p>
                <p className="text-sm text-green-600 mt-2">+15.2% from last month</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">Total Tokens</h3>
                  <BarChart3 className="text-gray-400" size={20} />
                </div>
                <p className="text-3xl font-bold">4.2M</p>
                <p className="text-sm text-green-600 mt-2">+8.7% from last month</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">Success Rate</h3>
                  <Check className="text-gray-400" size={20} />
                </div>
                <p className="text-3xl font-bold">98.7%</p>
                <p className="text-sm text-green-600 mt-2">+0.5% from last month</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">Avg. Response Time</h3>
                  <Clock className="text-gray-400" size={20} />
                </div>
                <p className="text-3xl font-bold">1.2s</p>
                <p className="text-sm text-green-600 mt-2">-0.3s from last month</p>
              </div>
            </div>
            
            {/* Top Users and Error Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Top Users</h3>
                  <button className="text-sm text-accent hover:underline">
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-1/3">
                        <p className="text-sm font-medium truncate">user{i+1}@example.com</p>
                      </div>
                      <div className="w-2/3 pl-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-black h-2 rounded-full" 
                              style={{ width: `${90 - i * 15}%` }}
                            ></div>
                          </div>
                          <span className="ml-4 text-sm text-gray-500">
                            {(500000 - i * 80000).toLocaleString()} tokens
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Error Analysis</h3>
                  <button className="text-sm text-accent hover:underline">
                    View details
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-1/3">
                      <p className="text-sm font-medium">Rate limited</p>
                    </div>
                    <div className="w-2/3 pl-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: '45%' }}
                          ></div>
                        </div>
                        <span className="ml-4 text-sm text-gray-500">45%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1/3">
                      <p className="text-sm font-medium">Invalid request</p>
                    </div>
                    <div className="w-2/3 pl-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: '30%' }}
                          ></div>
                        </div>
                        <span className="ml-4 text-sm text-gray-500">30%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1/3">
                      <p className="text-sm font-medium">Quota exceeded</p>
                    </div>
                    <div className="w-2/3 pl-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: '15%' }}
                          ></div>
                        </div>
                        <span className="ml-4 text-sm text-gray-500">15%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1/3">
                      <p className="text-sm font-medium">Server error</p>
                    </div>
                    <div className="w-2/3 pl-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-700 h-2 rounded-full" 
                            style={{ width: '10%' }}
                          ></div>
                        </div>
                        <span className="ml-4 text-sm text-gray-500">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Export Analytics */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-bold mb-6">Export Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-xl p-6 hover:border-black transition-colors">
                  <h4 className="font-bold text-xl mb-2">Usage Report</h4>
                  <p className="text-gray-600 mb-6">Export detailed usage statistics by user, API key, and endpoint.</p>
                  <button className="flex items-center text-accent hover:underline">
                    <Download className="mr-2" size={18} />
                    Export CSV
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-6 hover:border-black transition-colors">
                  <h4 className="font-bold text-xl mb-2">Error Report</h4>
                  <p className="text-gray-600 mb-6">Export detailed error logs with timestamps and error codes.</p>
                  <button className="flex items-center text-accent hover:underline">
                    <Download className="mr-2" size={18} />
                    Export CSV
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-6 hover:border-black transition-colors">
                  <h4 className="font-bold text-xl mb-2">Billing Report</h4>
                  <p className="text-gray-600 mb-6">Export detailed billing information by user and subscription.</p>
                  <button className="flex items-center text-accent hover:underline">
                    <Download className="mr-2" size={18} />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">System Logs</h2>
            
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="relative flex-grow md:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-10"
                    placeholder="Search logs..."
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 text-gray-400 mr-2" />
                    <select className="form-input">
                      <option value="all">All Status</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <button className="btn bg-white border border-gray-300 hover:bg-gray-50">
                    Export Logs
                  </button>
                </div>
              </div>
            </div>
            
            {/* Logs Table */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
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
                        OpenRouter Key
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
                    {usageLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.timestamp}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">{log.api_key}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.endpoint}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.tokens_used}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.openrouter_key_used || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.success ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {log.error_code || 'Error'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-accent hover:underline"
                            aria-label="View log details"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{usageLogs.length}</span> of <span className="font-medium">1,000+</span> results
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">System Settings</h2>
            
            {/* API Settings */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
              <h3 className="text-lg font-bold mb-6">API Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="default-timeout" className="block text-sm font-medium text-gray-700 mb-1">
                    Default Request Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    id="default-timeout"
                    className="form-input"
                    defaultValue="30"
                  />
                </div>
                <div>
                  <label htmlFor="max-tokens" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Tokens per Request
                  </label>
                  <input
                    type="number"
                    id="max-tokens"
                    className="form-input"
                    defaultValue="4000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="retry-attempts" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Retry Attempts
                  </label>
                  <input
                    type="number"
                    id="retry-attempts"
                    className="form-input"
                    defaultValue="3"
                  />
                </div>
                <div>
                  <label htmlFor="retry-delay" className="block text-sm font-medium text-gray-700 mb-1">
                    Retry Delay (milliseconds)
                  </label>
                  <input
                    type="number"
                    id="retry-delay"
                    className="form-input"
                    defaultValue="1000"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn btn-primary">
                  Save API Settings
                </button>
              </div>
            </div>
            
            {/* Tier Settings */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
              <h3 className="text-lg font-bold mb-6">Tier Settings</h3>
              
              {/* Free Tier */}
              <div className="border border-gray-200 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-xl mb-4">Free Tier</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="free-model" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Model
                    </label>
                    <select
                      id="free-model"
                      className="form-input"
                      defaultValue="openai/gpt-3.5-turbo"
                    >
                      <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="openai/gpt-4">GPT-4</option>
                      <option value="anthropic/claude-2">Claude 2</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="free-rate-limit" className="block text-sm font-medium text-gray-700 mb-1">
                      Rate Limit (requests per minute)
                    </label>
                    <input
                      type="number"
                      id="free-rate-limit"
                      className="form-input"
                      defaultValue="10"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="free-quota" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Token Quota
                  </label>
                  <input
                    type="number"
                    id="free-quota"
                    className="form-input"
                    defaultValue="10000"
                  />
                </div>
              </div>
              
              {/* Pro Tier */}
              <div className="border border-gray-200 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-xl mb-4">Professional Tier</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="pro-model" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Model
                    </label>
                    <select
                      id="pro-model"
                      className="form-input"
                      defaultValue="openai/gpt-4"
                    >
                      <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="openai/gpt-4">GPT-4</option>
                      <option value="anthropic/claude-2">Claude 2</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pro-rate-limit" className="block text-sm font-medium text-gray-700 mb-1">
                      Rate Limit (requests per minute)
                    </label>
                    <input
                      type="number"
                      id="pro-rate-limit"
                      className="form-input"
                      defaultValue="60"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="pro-quota" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Token Quota
                  </label>
                  <input
                    type="number"
                    id="pro-quota"
                    className="form-input"
                    defaultValue="1000000"
                  />
                </div>
              </div>
              
              {/* Pay-as-you-go Tier */}
              <div className="border border-gray-200 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-xl mb-4">Pay-as-you-go Tier</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="payg-model" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Model
                    </label>
                    <select
                      id="payg-model"
                      className="form-input"
                      defaultValue="openai/gpt-4"
                    >
                      <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="openai/gpt-4">GPT-4</option>
                      <option value="anthropic/claude-2">Claude 2</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="payg-rate-limit" className="block text-sm font-medium text-gray-700 mb-1">
                      Rate Limit (requests per minute)
                    </label>
                    <input
                      type="number"
                      id="payg-rate-limit"
                      className="form-input"
                      defaultValue="30"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="payg-price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price per 1,000 Tokens (USD)
                  </label>
                  <input
                    type="number"
                    id="payg-price"
                    className="form-input"
                    defaultValue="0.01"
                    step="0.001"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="btn btn-primary">
                  Save Tier Settings
                </button>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-bold mb-6">Notification Settings</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Alerts</p>
                    <p className="text-sm text-gray-500">Receive alerts for system issues and outages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Usage Alerts</p>
                    <p className="text-sm text-gray-500">Receive alerts when usage exceeds thresholds</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Billing Alerts</p>
                    <p className="text-sm text-gray-500">Receive alerts for billing events and issues</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-gray-500">Receive alerts for security events and issues</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="alert-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Email Addresses (comma-separated)
                </label>
                <input
                  type="text"
                  id="alert-email"
                  className="form-input"
                  defaultValue="admin@control.ai, alerts@control.ai"
                />
              </div>
              
              <div className="flex justify-end mt-6">
                <button className="btn btn-primary">
                  Save Notification Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}