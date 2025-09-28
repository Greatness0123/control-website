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
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  setDoc,
  Timestamp
} from 'firebase/firestore';
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

// Define types for user data and API keys
interface UserData {
  email?: string;
  displayName?: string;
  plan?: string;
  token_balance?: number;
  company?: string;
  webhook_url?: string;
  email_notifications?: boolean;
  created_at?: any;
  [key: string]: any; // Allow any other properties
}

interface ApiKey {
  id: string;
  name: string;
  tier: string;
  user_id?: string;
  user_email?: string;
  quota: number;
  usage: number;
  created_at?: any;
  last_used?: any;
  status: string;
  created?: string;
  lastUsed?: string;
}

interface UsageData {
  date: string;
  tokens: number;
  api_calls: number;
}

interface ModelUsageData {
  name: string;
  value: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [modelUsageData, setModelUsageData] = useState<ModelUsageData[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user data with error handling
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            // Create user document if it doesn't exist
            const newUserData: UserData = {
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || '',
              plan: 'Free',
              token_balance: 10000,
              created_at: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', user.uid), newUserData);
            setUserData(newUserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set default user data on error
          setUserData({
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || '',
            plan: 'Free',
            token_balance: 10000,
            created_at: new Date(),
          });
        }
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Fetch API keys with error handling
  useEffect(() => {
    const fetchApiKeys = async () => {
      if (user) {
        try {
          const keysQuery = query(
            collection(db, 'api_keys'),
            where('user_id', '==', user.uid)
          );
          
          const keysSnapshot = await getDocs(keysQuery);
          const keys = keysSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              created: data.created_at?.toDate().toISOString().split('T')[0] || 'N/A',
              lastUsed: data.last_used?.toDate().toISOString().split('T')[0] || 'N/A',
            } as ApiKey;
          });
          
          setApiKeys(keys);
        } catch (error) {
          console.error('Error fetching API keys:', error);
          // Set empty array on error
          setApiKeys([]);
        }
      }
    };

    fetchApiKeys();
  }, [user]);

  // Fetch real usage data from Firebase
  useEffect(() => {
    const fetchUsageData = async () => {
      if (user) {
        try {
          // Get the last 7 days
          const today = new Date();
          const last7Days = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(today.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
          });

          // Query usage data from Firebase
          const usageQuery = query(
            collection(db, 'usage'),
            where('user_id', '==', user.uid),
            where('date', '>=', last7Days[0]),
            orderBy('date', 'asc')
          );

          const usageSnapshot = await getDocs(usageQuery);
          const usageByDate: Record<string, {tokens: number, api_calls: number}> = {};

          usageSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const date = data.date;
            usageByDate[date] = {
              tokens: (usageByDate[date]?.tokens || 0) + (data.tokens || 0),
              api_calls: (usageByDate[date]?.api_calls || 0) + (data.api_calls || 0)
            };
          });

          // Fill in missing dates with zero
          const formattedUsageData = last7Days.map(date => ({
            date,
            tokens: usageByDate[date]?.tokens || 0,
            api_calls: usageByDate[date]?.api_calls || 0
          }));

          setUsageData(formattedUsageData);
        } catch (error) {
          console.error('Error fetching usage data:', error);
          // Generate zero data on error instead of random data
          const today = new Date();
          const zeroData = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(today.getDate() - (6 - i));
            return {
              date: date.toISOString().split('T')[0],
              tokens: 0,
              api_calls: 0
            };
          });
          setUsageData(zeroData);
        }
      }
    };

    fetchUsageData();
  }, [user]);

  // Fetch real model usage data from Firebase
  useEffect(() => {
    const fetchModelUsageData = async () => {
      if (user) {
        try {
          const modelUsageQuery = query(
            collection(db, 'model_usage'),
            where('user_id', '==', user.uid)
          );

          const modelUsageSnapshot = await getDocs(modelUsageQuery);
          
          if (!modelUsageSnapshot.empty) {
            const modelUsage = modelUsageSnapshot.docs.map(doc => ({
              name: doc.data().model,
              value: doc.data().percentage || 0
            }));
            setModelUsageData(modelUsage);
          } else {
            // Set zero usage data instead of random data
            setModelUsageData([
              { name: 'GPT-3.5', value: 0 },
              { name: 'GPT-4', value: 0 },
              { name: 'Claude', value: 0 },
            ]);
          }
        } catch (error) {
          console.error('Error fetching model usage data:', error);
          // Set zero usage data on error
          setModelUsageData([
            { name: 'GPT-3.5', value: 0 },
            { name: 'GPT-4', value: 0 },
            { name: 'Claude', value: 0 },
          ]);
        }
      }
    };

    fetchModelUsageData();
  }, [user]);

  // Set loading state to false when all data is loaded
  useEffect(() => {
    if (userData && apiKeys && usageData.length > 0 && modelUsageData.length > 0) {
      setIsLoading(false);
    }
  }, [userData, apiKeys, usageData, modelUsageData]);

  // Copy API key to clipboard
  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Create new API key - tier based on user's current plan
  const handleCreateKey = async () => {
    if (!newKeyName || !user || !userData) return;
    
    setIsLoading(true);
    
    try {
      // Generate a random API key
      const keyId = `ctrl-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      // Set tier based on user's current plan - users cannot choose tier
      let tier = 'free';
      let quota = 10000;
      
      switch (userData.plan) {
        case 'Pro':
          tier = 'pro';
          quota = 1000000;
          break;
        case 'Pay-as-you-go':
          tier = 'payg';
          quota = 0; // Unlimited for pay-as-you-go
          break;
        default:
          tier = 'free';
          quota = 10000;
          break;
      }
      
      // Create new key in Firestore
      const newKey: ApiKey = {
        id: keyId,
        name: newKeyName,
        tier: tier,
        user_id: user.uid,
        user_email: user.email || '',
        quota: quota,
        usage: 0,
        created_at: serverTimestamp(),
        last_used: null,
        status: 'active',
      };
      
      await addDoc(collection(db, 'api_keys'), newKey);
      
      // Add to local state
      setApiKeys([
        {
          ...newKey,
          created: new Date().toISOString().split('T')[0],
          lastUsed: '-',
        },
        ...apiKeys
      ]);
      
      setIsCreatingKey(false);
      setNewKeyName('');
    } catch (error) {
      console.error('Error creating API key:', error);
      setErrorMessage('Failed to create API key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke API key
  const revokeKey = async (keyId: string) => {
    try {
      // Find the document with this key ID
      const keysQuery = query(
        collection(db, 'api_keys'),
        where('id', '==', keyId)
      );
      
      const keySnapshot = await getDocs(keysQuery);
      
      if (!keySnapshot.empty) {
        const keyDoc = keySnapshot.docs[0];
        await updateDoc(doc(db, 'api_keys', keyDoc.id), {
          status: 'revoked'
        });
        
        // Update local state
        setApiKeys(apiKeys.map(key => 
          key.id === keyId ? { ...key, status: 'revoked' } : key
        ));
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      setErrorMessage('Failed to revoke API key.');
    }
  };

  // Delete API key
  const deleteKey = async (keyId: string) => {
    try {
      // Find the document with this key ID
      const keysQuery = query(
        collection(db, 'api_keys'),
        where('id', '==', keyId)
      );
      
      const keySnapshot = await getDocs(keysQuery);
      
      if (!keySnapshot.empty) {
        const keyDoc = keySnapshot.docs[0];
        await deleteDoc(doc(db, 'api_keys', keyDoc.id));
        
        // Update local state
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      setErrorMessage('Failed to delete API key.');
    }
  };

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

      {/* Error Message */}
      {errorMessage && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{errorMessage}</p>
            <button 
              className="mt-2 text-sm underline"
              onClick={() => setErrorMessage(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
                <p className="text-3xl font-bold">
                  {usageData.reduce((sum, day) => sum + (day.api_calls || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  {usageData.length > 1 && usageData[usageData.length - 1].api_calls > usageData[usageData.length - 2].api_calls ? '+' : ''}
                  {usageData.length > 1 ? Math.abs(((usageData[usageData.length - 1].api_calls - usageData[usageData.length - 2].api_calls) / (usageData[usageData.length - 2].api_calls || 1)) * 100).toFixed(1) : '0'}% from yesterday
                </p>
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
                <p className="text-3xl font-bold">
                  {usageData.reduce((sum, day) => sum + (day.tokens || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  {usageData.length > 1 && usageData[usageData.length - 1].tokens > usageData[usageData.length - 2].tokens ? '+' : ''}
                  {usageData.length > 1 ? Math.abs(((usageData[usageData.length - 1].tokens - usageData[usageData.length - 2].tokens) / (usageData[usageData.length - 2].tokens || 1)) * 100).toFixed(1) : '0'}% from yesterday
                </p>
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
                <p className="text-sm text-gray-500 mt-2">
                  {apiKeys.length > 0 
                    ? `Last created on ${apiKeys[0].created}` 
                    : 'No keys created yet'}
                </p>
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
                <p className="text-3xl font-bold">{userData?.token_balance?.toLocaleString() || 0}</p>
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
                      formatter={(value, name) => [`${value} ${name === 'tokens' ? 'tokens' : 'calls'}`, name === 'tokens' ? 'Tokens' : 'API Calls']}
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
            
            {/* API Calls Chart */}
            <motion.div 
              className="bg-white rounded-2xl shadow-soft p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <h3 className="text-lg font-bold mb-6">API Calls (Last 7 Days)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
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
                      formatter={(value) => [`${value} calls`, 'API Calls']}
                      labelFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.toLocaleDateString()}`;
                      }}
                    />
                    <Bar dataKey="api_calls" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            
            {/* Quick Actions and Recent API Keys */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                className="bg-white rounded-2xl shadow-soft p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
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
                transition={{ duration: 0.3, delay: 0.7 }}
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
                  {apiKeys.length > 0 ? (
                    apiKeys.slice(0, 3).map((key) => (
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
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No API keys yet</p>
                      <button 
                        className="mt-2 text-accent hover:underline"
                        onClick={() => {
                          setActiveTab('api-keys');
                          setIsCreatingKey(true);
                        }}
                      >
                        Create your first API key
                      </button>
                    </div>
                  )}
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
                onClick={() => setIsCreatingKey(true)}
              >
                <Plus className="mr-2" size={18} />
                Create New Key
              </button>
            </div>

             <div className="bg-red-50 border-l-4 border-red-400 p-4 ">
                      <p className="text-red-800">
                        <strong>Important:</strong> the site is currently in beta. API keys are limited and are still in the development phase. Please make use of your personal api keys and your preferred model from openrouter.
                      </p>
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
                <div className="mb-6">
                  <label htmlFor="key-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name
                  </label>
                  <input
                    type="text"
                    id="key-name"
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                    placeholder="e.g., Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Tier (Based on your {userData?.plan || 'Free'} plan)
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Your API key will be created with <strong>{userData?.plan || 'Free'}</strong> tier permissions.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {userData?.plan === 'Pro' ? '1,000,000 tokens/month' : 
                       userData?.plan === 'Pay-as-you-go' ? 'Unlimited tokens (pay per use)' : 
                       '10,000 tokens/month'}
                    </p>
                  </div>
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
              </motion.div>
            )}
            
            {/* API Keys Table */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name / Key ID
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
                    {apiKeys.length > 0 ? (
                      apiKeys.map((key) => (
                        <tr key={key.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{key.name}</div>
                              <div className="text-sm text-gray-500 font-mono">{key.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">{key.tier}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {key.usage?.toLocaleString() || 0} / {key.quota > 0 ? key.quota.toLocaleString() : '∞'}
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
                                aria-label={key.status === 'active' ? 'Revoke API key' : 'Delete API key'}
                                onClick={() => key.status === 'active' ? revokeKey(key.id) : deleteKey(key.id)}
                              >
                                {key.status === 'active' ? <RefreshCw size={16} /> : <Trash2 size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <p className="text-gray-500">No API keys found</p>
                          <p className="text-sm text-gray-400 mt-1">Create your first API key to get started</p>
                        </td>
                      </tr>
                    )}
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
                      formatter={(value, name) => [`${value} ${name === 'tokens' ? 'tokens' : 'calls'}`, name === 'tokens' ? 'Tokens' : 'API Calls']}
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
                    <PieChart>
                      <Pie
                        data={modelUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {modelUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0088FE', '#000000', '#FFBB28'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-bold mb-6">Usage by API Key</h3>
                <div className="space-y-4">
                  {apiKeys.length > 0 ? (
                    apiKeys.map((key) => {
                      // Calculate actual usage based on Firebase data
                      const usagePercentage = key.quota > 0 ? Math.min(100, (key.usage / key.quota) * 100) : 0;
                      const usageTokens = key.usage;
                      
                      return (
                        <div key={key.id} className="flex items-center">
                          <div className="w-1/3">
                            <p className="text-sm font-medium truncate">{key.name}</p>
                          </div>
                          <div className="w-2/3 pl-4">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-black h-2 rounded-full" 
                                  style={{ width: `${usagePercentage}%` }}
                                ></div>
                              </div>
                              <span className="ml-4 text-sm text-gray-500">
                                {usageTokens.toLocaleString()} tokens
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No API keys yet</p>
                      <button 
                        className="mt-2 text-accent hover:underline"
                        onClick={() => {
                          setActiveTab('api-keys');
                          setIsCreatingKey(true);
                        }}
                      >
                        Create your first API key
                      </button>
                    </div>
                  )}
                </div>
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
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
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
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      defaultValue={user?.email || ''}
                      disabled
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="btn btn-primary">
                    Save Changes
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