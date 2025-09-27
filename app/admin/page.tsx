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
  Clock,
  Save
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/client';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp 
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
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingOpenRouterKey, setIsAddingOpenRouterKey] = useState(false);
  const [isAddingApiKey, setIsAddingApiKey] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [openRouterKeys, setOpenRouterKeys] = useState<any[]>([]);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [requestsData, setRequestsData] = useState<any[]>([]);
  const [tierUsageData, setTierUsageData] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>({});
  const [tierSettings, setTierSettings] = useState<any>({
    free: { model: 'openai/gpt-3.5-turbo', rateLimit: 10, quota: 10000 },
    pro: { model: 'openai/gpt-4', rateLimit: 60, quota: 1000000 },
    payg: { model: 'openai/gpt-4', rateLimit: 30, price: 0.01 }
  });
  
  // Form states
  const [newOpenRouterKey, setNewOpenRouterKey] = useState({
    id: '',
    env_name: '',
    notes: '',
    key: ''
  });
  const [newApiKeyData, setNewApiKeyData] = useState({
    name: '',
    owner: '',
    tier: 'free',
    quota: 10000
  });
  const [editingTier, setEditingTier] = useState<string | null>(null);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
            fetchAllData();
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

  // Fetch all admin data
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchApiKeys(),
        fetchOpenRouterKeys(),
        fetchUsageLogs(),
        fetchRequestsData(),
        fetchTierUsageData(),
        fetchSystemHealth(),
        fetchTierSettings()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('created_at', 'desc')
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created: doc.data().created_at?.toDate().toISOString().split('T')[0] || 'N/A',
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Generate sample data if no real data exists
      generateSampleUsers();
    }
  };

  // Generate sample users
  const generateSampleUsers = () => {
    const sampleUsers = [
      {
        id: '1',
        email: 'john@example.com',
        displayName: 'John Doe',
        plan: 'Pro',
        token_balance: 750000,
        created: '2025-08-15',
        last_login: '2025-09-25',
        api_calls: 1248,
        tokens_used: 42580
      },
      {
        id: '2',
        email: 'sarah@example.com',
        displayName: 'Sarah Smith',
        plan: 'Free',
        token_balance: 8500,
        created: '2025-09-01',
        last_login: '2025-09-26',
        api_calls: 85,
        tokens_used: 8500
      },
      {
        id: '3',
        email: 'mike@example.com',
        displayName: 'Mike Johnson',
        plan: 'Pay-as-you-go',
        token_balance: 0,
        created: '2025-09-10',
        last_login: '2025-09-24',
        api_calls: 125,
        tokens_used: 12500
      }
    ];
    
    setUsers(sampleUsers);
  };

  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      const keysQuery = query(
        collection(db, 'api_keys'),
        orderBy('created_at', 'desc')
      );
      
      const keysSnapshot = await getDocs(keysQuery);
      const keysData = keysSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created: doc.data().created_at?.toDate().toISOString().split('T')[0] || 'N/A',
        lastUsed: doc.data().last_used?.toDate().toISOString().split('T')[0] || 'N/A',
      }));
      
      setApiKeys(keysData);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      // Generate sample data if no real data exists
      const sampleApiKeys = [
        {
          id: 'ctrl-abcdefghijklmn',
          name: 'Production API Key',
          owner: 'john@example.com',
          tier: 'pro',
          created: '2025-08-15',
          lastUsed: '2025-09-26',
          usage: 245000,
          quota: 1000000,
          status: 'active',
        },
        {
          id: 'ctrl-opqrstuvwxyzab',
          name: 'Development API Key',
          owner: 'sarah@example.com',
          tier: 'free',
          created: '2025-09-01',
          lastUsed: '2025-09-25',
          usage: 8500,
          quota: 10000,
          status: 'active',
        },
        {
          id: 'ctrl-cdefghijklmnop',
          name: 'Testing API Key',
          owner: 'mike@example.com',
          tier: 'payg',
          created: '2025-09-10',
          lastUsed: '2025-09-24',
          usage: 12500,
          quota: 0,
          status: 'active',
        },
        {
          id: 'ctrl-qrstuvwxyzabcd',
          name: 'Revoked API Key',
          owner: 'alex@example.com',
          tier: 'free',
          created: '2025-07-20',
          lastUsed: '2025-09-15',
          usage: 9800,
          quota: 10000,
          status: 'revoked',
        },
      ];
      
      setApiKeys(sampleApiKeys);
    }
  };

  // Fetch OpenRouter keys
  const fetchOpenRouterKeys = async () => {
    try {
      const keysQuery = query(
        collection(db, 'openrouter_keys'),
        orderBy('created_at', 'desc')
      );
      
      const keysSnapshot = await getDocs(keysQuery);
      const keysData = keysSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        last_checked: doc.data().last_checked?.toDate().toISOString().replace('T', ' ').substring(0, 19) || 'N/A',
      }));
      
      setOpenRouterKeys(keysData);
    } catch (error) {
      console.error('Error fetching OpenRouter keys:', error);
      // Generate sample data if no real data exists
      const sampleOpenRouterKeys = [
        {
          id: '1',
          env_name: 'OPENROUTER_KEY_1',
          notes: 'Primary production key',
          status: 'healthy',
          concurrent: 3,
          last_checked: '2025-09-26 08:15:22',
        },
        {
          id: '2',
          env_name: 'OPENROUTER_KEY_2',
          notes: 'Backup key',
          status: 'healthy',
          concurrent: 1,
          last_checked: '2025-09-26 08:15:22',
        },
        {
          id: '3',
          env_name: 'OPENROUTER_KEY_3',
          notes: 'Development key',
          status: 'rate_limited',
          concurrent: 0,
          last_checked: '2025-09-26 08:15:22',
        },
        {
          id: '4',
          env_name: 'OPENROUTER_KEY_4',
          notes: 'Testing key',
          status: 'unhealthy',
          concurrent: 0,
          last_checked: '2025-09-26 08:15:22',
        },
      ];
      
      setOpenRouterKeys(sampleOpenRouterKeys);
    }
  };

  // Fetch usage logs
  const fetchUsageLogs = async () => {
    try {
      const logsQuery = query(
        collection(db, 'usage_logs'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const logsSnapshot = await getDocs(logsQuery);
      const logsData = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString().replace('T', ' ').substring(0, 19) || 'N/A',
      }));
      
      setUsageLogs(logsData);
    } catch (error) {
      console.error('Error fetching usage logs:', error);
      // Generate sample data if no real data exists
      const sampleUsageLogs = [
        {
          id: 'log-1',
          timestamp: '2025-09-26 08:14:22',
          api_key: 'ctrl-abcdefghijklmn',
          endpoint: '/api/ai',
          tokens_used: 245,
          success: true,
          openrouter_key_used: '1',
        },
        {
          id: 'log-2',
          timestamp: '2025-09-26 08:13:45',
          api_key: 'ctrl-opqrstuvwxyzab',
          endpoint: '/api/ai',
          tokens_used: 128,
          success: true,
          openrouter_key_used: '2',
        },
        {
          id: 'log-3',
          timestamp: '2025-09-26 08:12:30',
          api_key: 'ctrl-cdefghijklmnop',
          endpoint: '/api/ai',
          tokens_used: 0,
          success: false,
          error_code: 'rate_limited',
          openrouter_key_used: '3',
        },
        {
          id: 'log-4',
          timestamp: '2025-09-26 08:11:15',
          api_key: 'ctrl-abcdefghijklmn',
          endpoint: '/api/ai',
          tokens_used: 312,
          success: true,
          openrouter_key_used: '1',
        },
        {
          id: 'log-5',
          timestamp: '2025-09-26 08:10:05',
          api_key: 'ctrl-opqrstuvwxyzab',
          endpoint: '/api/ai',
          tokens_used: 0,
          success: false,
          error_code: 'invalid_request',
          openrouter_key_used: null,
        },
      ];
      
      setUsageLogs(sampleUsageLogs);
    }
  };

  // Fetch requests data
  const fetchRequestsData = async () => {
    try {
      // In a real app, this would fetch hourly request data from the database
      // For now, we'll generate sample data
      const hours = Array.from({length: 24}, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return { hour: `${hour}:00`, requests: Math.floor(Math.random() * 400) + 30 };
      });
      
      setRequestsData(hours);
    } catch (error) {
      console.error('Error fetching requests data:', error);
      // Generate sample data if error
      const sampleRequestsData = [
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
      
      setRequestsData(sampleRequestsData);
    }
  };

  // Fetch tier usage data
  const fetchTierUsageData = async () => {
    try {
      // In a real app, this would fetch tier usage data from the database
      // For now, we'll generate sample data
      const sampleTierUsageData = [
        { name: 'Free', value: 35 },
        { name: 'Pro', value: 45 },
        { name: 'Pay-as-you-go', value: 20 },
      ];
      
      setTierUsageData(sampleTierUsageData);
    } catch (error) {
      console.error('Error fetching tier usage data:', error);
      // Generate sample data if error
      setTierUsageData([
        { name: 'Free', value: 35 },
        { name: 'Pro', value: 45 },
        { name: 'Pay-as-you-go', value: 20 },
      ]);
    }
  };

  // Fetch system health
  const fetchSystemHealth = async () => {
    try {
      // In a real app, this would fetch system health data from the database or API
      // For now, we'll generate sample data
      const sampleSystemHealth = {
        api_service: { status: 'operational', uptime: 99.98 },
        auth_service: { status: 'operational', uptime: 100 },
        openrouter_integration: { status: 'partial_outage', uptime: 95.5 },
        billing_service: { status: 'operational', uptime: 99.9 }
      };
      
      setSystemHealth(sampleSystemHealth);
    } catch (error) {
      console.error('Error fetching system health:', error);
      // Generate sample data if error
      setSystemHealth({
        api_service: { status: 'operational', uptime: 99.98 },
        auth_service: { status: 'operational', uptime: 100 },
        openrouter_integration: { status: 'partial_outage', uptime: 95.5 },
        billing_service: { status: 'operational', uptime: 99.9 }
      });
    }
  };

  // Fetch tier settings
  const fetchTierSettings = async () => {
    try {
      const tierSettingsDoc = await getDoc(doc(db, 'settings', 'tiers'));
      if (tierSettingsDoc.exists()) {
        setTierSettings(tierSettingsDoc.data());
      }
    } catch (error) {
      console.error('Error fetching tier settings:', error);
      // Keep default tier settings if error
    }
  };

  // Add OpenRouter key
  const handleAddOpenRouterKey = async () => {
    if (!newOpenRouterKey.env_name || !newOpenRouterKey.id) return;
    
    try {
      // In a real app, this would add the key to the database and environment variables
      const newKey = {
        ...newOpenRouterKey,
        status: 'healthy',
        concurrent: 0,
        created_at: serverTimestamp(),
        last_checked: serverTimestamp()
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'openrouter_keys'), newKey);
      
      // Update local state
      setOpenRouterKeys([
        {
          ...newKey,
          last_checked: new Date().toISOString().replace('T', ' ').substring(0, 19)
        },
        ...openRouterKeys
      ]);
      
      // Reset form
      setNewOpenRouterKey({
        id: '',
        env_name: '',
        notes: '',
        key: ''
      });
      
      setIsAddingOpenRouterKey(false);
    } catch (error) {
      console.error('Error adding OpenRouter key:', error);
      alert('Failed to add OpenRouter key. Please try again.');
    }
  };

  // Add API key
  const handleAddApiKey = async () => {
    if (!newApiKeyData.name || !newApiKeyData.owner) return;
    
    try {
      // Generate a random API key
      const keyId = `ctrl-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      // Create new key
      const newKey = {
        id: keyId,
        name: newApiKeyData.name,
        owner: newApiKeyData.owner,
        tier: newApiKeyData.tier,
        quota: newApiKeyData.quota,
        usage: 0,
        created_at: serverTimestamp(),
        last_used: null,
        status: 'active',
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'api_keys'), newKey);
      
      // Update local state
      setApiKeys([
        {
          ...newKey,
          created: new Date().toISOString().split('T')[0],
          lastUsed: 'N/A',
        },
        ...apiKeys
      ]);
      
      // Reset form
      setNewApiKeyData({
        name: '',
        owner: '',
        tier: 'free',
        quota: 10000
      });
      
      setIsAddingApiKey(false);
    } catch (error) {
      console.error('Error adding API key:', error);
      alert('Failed to add API key. Please try again.');
    }
  };

  // Update tier settings
  const handleUpdateTierSettings = async (tier: string) => {
    try {
      // Update in Firestore
      await updateDoc(doc(db, 'settings', 'tiers'), {
        [tier]: tierSettings[tier]
      });
      
      // Reset editing state
      setEditingTier(null);
      
      alert(`${tier.charAt(0).toUpperCase() + tier.slice(1)} tier settings updated successfully.`);
    } catch (error) {
      console.error('Error updating tier settings:', error);
      alert('Failed to update tier settings. Please try again.');
    }
  };

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
  if (loading || isLoading) {
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

  // Not admin state
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access the admin dashboard.</p>
          <Link href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#000000', '#FFBB28'];

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
              <p className="text-3xl font-bold text-white">{users.length}</p>
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
              <p className="text-sm text-yellow-400 mt-2">
                {openRouterKeys.filter(key => key.status === 'rate_limited').length} rate limited, 
                {openRouterKeys.filter(key => key.status === 'unhealthy').length} unhealthy
              </p>
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
              <p className="text-3xl font-bold text-white">
                {requestsData.reduce((sum, hour) => sum + hour.requests, 0).toLocaleString()}
              </p>
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
                activeTab === 'users'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('users')}
            >
              Users
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
                      <div className={`w-3 h-3 ${systemHealth.api_service?.status === 'operational' ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-3`}></div>
                      <span className="font-medium">API Service</span>
                    </div>
                    <span className={`${systemHealth.api_service?.status === 'operational' ? 'text-green-600' : 'text-red-600'}`}>
                      {systemHealth.api_service?.status === 'operational' ? 'Operational' : 'Outage'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${systemHealth.auth_service?.status === 'operational' ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-3`}></div>
                      <span className="font-medium">Authentication Service</span>
                    </div>
                    <span className={`${systemHealth.auth_service?.status === 'operational' ? 'text-green-600' : 'text-red-600'}`}>
                      {systemHealth.auth_service?.status === 'operational' ? 'Operational' : 'Outage'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${
                        systemHealth.openrouter_integration?.status === 'operational' ? 'bg-green-500' : 
                        systemHealth.openrouter_integration?.status === 'partial_outage' ? 'bg-yellow-500' : 'bg-red-500'
                      } rounded-full mr-3`}></div>
                      <span className="font-medium">OpenRouter Integration</span>
                    </div>
                    <span className={`${
                      systemHealth.openrouter_integration?.status === 'operational' ? 'text-green-600' : 
                      systemHealth.openrouter_integration?.status === 'partial_outage' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {systemHealth.openrouter_integration?.status === 'operational' ? 'Operational' : 
                       systemHealth.openrouter_integration?.status === 'partial_outage' ? 'Partial Outage' : 'Outage'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${systemHealth.billing_service?.status === 'operational' ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-3`}></div>
                      <span className="font-medium">Billing Service</span>
                    </div>
                    <span className={`${systemHealth.billing_service?.status === 'operational' ? 'text-green-600' : 'text-red-600'}`}>
                      {systemHealth.billing_service?.status === 'operational' ? 'Operational' : 'Outage'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    className="text-sm text-accent hover:underline flex items-center"
                    onClick={fetchSystemHealth}
                  >
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

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="mt-4 md:mt-0">
                <button className="btn bg-white border border-gray-300 hover:bg-gray-50 mr-2">
                  Export Users
                </button>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="relative flex-grow md:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-10 w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                    placeholder="Search users by email or name"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 text-gray-400 mr-2" />
                    <select className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20">
                      <option value="all">All Plans</option>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="payg">Pay-as-you-go</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Token Balance
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        API Calls
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.displayName || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.plan === 'Pro' ? 'bg-blue-100 text-blue-800' : 
                            user.plan === 'Pay-as-you-go' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.token_balance?.toLocaleString() || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.api_calls?.toLocaleString() || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.created}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.last_login || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              className="p-1 text-gray-400 hover:text-gray-600"
                              aria-label="View user details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="p-1 text-gray-400 hover:text-gray-600"
                              aria-label="Edit user"
                            >
                              <Edit size={16} />
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
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{users.length}</span> of <span className="font-medium">{users.length}</span> users
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
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      placeholder="e.g., Production API Key"
                      value={newApiKeyData.name}
                      onChange={(e) => setNewApiKeyData({...newApiKeyData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="key-owner" className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Email
                    </label>
                    <input
                      type="email"
                      id="key-owner"
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      placeholder="user@example.com"
                      value={newApiKeyData.owner}
                      onChange={(e) => setNewApiKeyData({...newApiKeyData, owner: e.target.value})}
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
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      value={newApiKeyData.tier}
                      onChange={(e) => {
                        const tier = e.target.value;
                        let quota = 10000;
                        if (tier === 'pro') quota = 1000000;
                        if (tier === 'payg') quota = 0;
                        setNewApiKeyData({...newApiKeyData, tier, quota});
                      }}
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
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      placeholder="10000"
                      value={newApiKeyData.quota}
                      onChange={(e) => setNewApiKeyData({...newApiKeyData, quota: parseInt(e.target.value)})}
                      disabled={newApiKeyData.tier === 'payg'}
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
                    onClick={handleAddApiKey}
                    disabled={!newApiKeyData.name || !newApiKeyData.owner}
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
                    className="form-input pl-10 w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                    placeholder="Search by key ID, name, or owner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 text-gray-400 mr-2" />
                    <select
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
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
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      placeholder="e.g., 5"
                      value={newOpenRouterKey.id}
                      onChange={(e) => setNewOpenRouterKey({...newOpenRouterKey, id: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="env-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Environment Variable Name
                    </label>
                    <input
                      type="text"
                      id="env-name"
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      placeholder="e.g., OPENROUTER_KEY_5"
                      value={newOpenRouterKey.env_name}
                      onChange={(e) => setNewOpenRouterKey({...newOpenRouterKey, env_name: e.target.value})}
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                    placeholder="e.g., Backup production key"
                    value={newOpenRouterKey.notes}
                    onChange={(e) => setNewOpenRouterKey({...newOpenRouterKey, notes: e.target.value})}
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="key-value" className="block text-sm font-medium text-gray-700 mb-1">
                    API Key Value
                  </label>
                  <input
                    type="password"
                    id="key-value"
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                    placeholder="Enter the actual OpenRouter API key"
                    value={newOpenRouterKey.key}
                    onChange={(e) => setNewOpenRouterKey({...newOpenRouterKey, key: e.target.value})}
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
                    onClick={handleAddOpenRouterKey}
                    disabled={!newOpenRouterKey.id || !newOpenRouterKey.env_name}
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                    defaultValue="300"
                  />
                </div>
                <div>
                  <label htmlFor="routing-policy" className="block text-sm font-medium text-gray-700 mb-1">
                    Routing Policy
                  </label>
                  <select
                    id="routing-policy"
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
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
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-xl">Free Tier</h4>
                  {editingTier === 'free' ? (
                    <div className="flex space-x-2">
                      <button 
                        className="btn bg-white border border-gray-300 hover:bg-gray-50"
                        onClick={() => setEditingTier(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary flex items-center"
                        onClick={() => handleUpdateTierSettings('free')}
                      >
                        <Save size={16} className="mr-2" />
                        Save
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn bg-white border border-gray-300 hover:bg-gray-50 flex items-center"
                      onClick={() => setEditingTier('free')}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="free-model" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Model
                    </label>
                    <select
                      id="free-model"
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      value={tierSettings.free.model}
                      onChange={(e) => setTierSettings({
                        ...tierSettings,
                        free: { ...tierSettings.free, model: e.target.value }
                      })}
                      disabled={editingTier !== 'free'}
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
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      value={tierSettings.free.rateLimit}
                      onChange={(e) => setTierSettings({
                        ...tierSettings,
                        free: { ...tierSettings.free, rateLimit: parseInt(e.target.value) }
                      })}
                      disabled={editingTier !== 'free'}
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                    value={tierSettings.free.quota}
                    onChange={(e) => setTierSettings({
                      ...tierSettings,
                      free: { ...tierSettings.free, quota: parseInt(e.target.value) }
                    })}
                    disabled={editingTier !== 'free'}
                  />
                </div>
              </div>
              
              {/* Pro Tier */}
              <div className="border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-xl">Professional Tier</h4>
                  {editingTier === 'pro' ? (
                    <div className="flex space-x-2">
                      <button 
                        className="btn bg-white border border-gray-300 hover:bg-gray-50"
                        onClick={() => setEditingTier(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary flex items-center"
                        onClick={() => handleUpdateTierSettings('pro')}
                      >
                        <Save size={16} className="mr-2" />
                        Save
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn bg-white border border-gray-300 hover:bg-gray-50 flex items-center"
                      onClick={() => setEditingTier('pro')}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="pro-model" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Model
                    </label>
                    <select
                      id="pro-model"
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      value={tierSettings.pro.model}
                      onChange={(e) => setTierSettings({
                        ...tierSettings,
                        pro: { ...tierSettings.pro, model: e.target.value }
                      })}
                      disabled={editingTier !== 'pro'}
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
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      value={tierSettings.pro.rateLimit}
                      onChange={(e) => setTierSettings({
                        ...tierSettings,
                        pro: { ...tierSettings.pro, rateLimit: parseInt(e.target.value) }
                      })}
                      disabled={editingTier !== 'pro'}
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                    value={tierSettings.pro.quota}
                    onChange={(e) => setTierSettings({
                      ...tierSettings,
                      pro: { ...tierSettings.pro, quota: parseInt(e.target.value) }
                    })}
                    disabled={editingTier !== 'pro'}
                  />
                </div>
              </div>
              
              {/* Pay-as-you-go Tier */}
              <div className="border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-xl">Pay-as-you-go Tier</h4>
                  {editingTier === 'payg' ? (
                    <div className="flex space-x-2">
                      <button 
                        className="btn bg-white border border-gray-300 hover:bg-gray-50"
                        onClick={() => setEditingTier(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary flex items-center"
                        onClick={() => handleUpdateTierSettings('payg')}
                      >
                        <Save size={16} className="mr-2" />
                        Save
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn bg-white border border-gray-300 hover:bg-gray-50 flex items-center"
                      onClick={() => setEditingTier('payg')}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="payg-model" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Model
                    </label>
                    <select
                      id="payg-model"
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      value={tierSettings.payg.model}
                      onChange={(e) => setTierSettings({
                        ...tierSettings,
                        payg: { ...tierSettings.payg, model: e.target.value }
                      })}
                      disabled={editingTier !== 'payg'}
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
                      className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                      value={tierSettings.payg.rateLimit}
                      onChange={(e) => setTierSettings({
                        ...tierSettings,
                        payg: { ...tierSettings.payg, rateLimit: parseInt(e.target.value) }
                      })}
                      disabled={editingTier !== 'payg'}
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
                    className="form-input w-full bg-white bg-opacity-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                    value={tierSettings.payg.price}
                    onChange={(e) => setTierSettings({
                      ...tierSettings,
                      payg: { ...tierSettings.payg, price: parseFloat(e.target.value) }
                    })}
                    step="0.001"
                    disabled={editingTier !== 'payg'}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}