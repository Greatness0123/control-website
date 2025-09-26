/**
 * Seed script for Firestore
 * 
 * This script initializes the Firestore database with sample data for:
 * - Tiers
 * - OpenRouter keys
 * - Sample API key
 * 
 * Usage:
 * 1. Set up your .env file with Firebase credentials
 * 2. Run: npm run seed
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
} catch (error) {
  console.error('Error parsing Firebase service account JSON:', error);
  throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

/**
 * Generate a new API key
 */
function generateApiKey() {
  const randomPart = uuidv4().replace(/-/g, '').substring(0, 16);
  return `ctrl-${randomPart}`;
}

/**
 * Seed the database
 */
async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Seed tiers
    console.log('Seeding tiers...');
    
    const tiers = [
      {
        name: 'free',
        display_name: 'Free',
        description: 'Basic access for personal projects and testing',
        default_model: 'openai/gpt-3.5-turbo',
        rate_limit_per_min: 10,
        monthly_quota: 10000,
        price_per_token: 0,
        price: 0,
        features: [
          '10,000 tokens per month',
          '10 requests per minute',
          'GPT-3.5 Turbo access',
          'Basic support',
        ],
      },
      {
        name: 'pro',
        display_name: 'Professional',
        description: 'Enhanced access for businesses and power users',
        default_model: 'openai/gpt-4',
        rate_limit_per_min: 60,
        monthly_quota: 1000000,
        price_per_token: 0,
        price: 49.99,
        features: [
          '1,000,000 tokens per month',
          '60 requests per minute',
          'GPT-4 access',
          'Priority support',
          'Advanced analytics',
        ],
      },
      {
        name: 'payg',
        display_name: 'Pay As You Go',
        description: 'Flexible usage with no monthly commitment',
        default_model: 'openai/gpt-4',
        rate_limit_per_min: 30,
        monthly_quota: 0,
        price_per_token: 0.00001,
        price: 0,
        features: [
          'Pay only for what you use',
          '30 requests per minute',
          'GPT-4 access',
          'Standard support',
          'Usage analytics',
        ],
      },
    ];
    
    for (const tier of tiers) {
      await db.collection('tiers').doc(tier.name).set(tier);
      console.log(`Created tier: ${tier.name}`);
    }
    
    // Seed OpenRouter keys
    console.log('Seeding OpenRouter keys...');
    
    const openRouterKeys = [
      {
        id: '1',
        env_name: 'OPENROUTER_KEY_1',
        notes: 'Primary production key',
        status: 'healthy',
        last_checked: new Date(),
      },
      {
        id: '2',
        env_name: 'OPENROUTER_KEY_2',
        notes: 'Backup key',
        status: 'healthy',
        last_checked: new Date(),
      },
      {
        id: '3',
        env_name: 'OPENROUTER_KEY_3',
        notes: 'Development key',
        status: 'healthy',
        last_checked: new Date(),
      },
    ];
    
    for (const key of openRouterKeys) {
      await db.collection('openrouter_keys').doc(key.id).set(key);
      console.log(`Created OpenRouter key: ${key.id}`);
    }
    
    // Create a sample admin user
    console.log('Creating sample admin user...');
    
    const adminUser = {
      email: 'admin@control.com',
      displayName: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
      token_balance: 0,
      usage: 0,
      payg_due: 0,
    };
    
    const adminUserRef = await db.collection('users').add(adminUser);
    console.log(`Created admin user with ID: ${adminUserRef.id}`);
    
    // Create a sample API key
    console.log('Creating sample API key...');
    
    const apiKey = generateApiKey();
    const apiKeyData = {
      key: apiKey,
      tier: 'free',
      status: 'active',
      owner_uid: adminUserRef.id,
      monthly_quota: 10000,
      usage_this_month: 0,
      linked_openrouter_keys: ['1'],
      created_at: new Date(),
    };
    
    await db.collection('api_keys').doc(apiKey).set(apiKeyData);
    console.log(`Created API key: ${apiKey}`);
    
    console.log('Database seeding completed successfully!');
    console.log('\nSample API Key:', apiKey);
    console.log('Admin User ID:', adminUserRef.id);
    console.log('\nIMPORTANT: To use this admin account, you need to create a corresponding user in Firebase Authentication with the same email and link it to this Firestore document.');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error during seeding:', error);
    process.exit(1);
  });