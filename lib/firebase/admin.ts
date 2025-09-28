import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';

// Parse the service account JSON string from environment variable
let serviceAccount: any;
try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
  }

  serviceAccount = JSON.parse(serviceAccountJson);
  
  // Validate required fields
  if (!serviceAccount.project_id) {
    throw new Error('Service account JSON is missing project_id');
  }
  if (!serviceAccount.private_key) {
    throw new Error('Service account JSON is missing private_key');
  }
  if (!serviceAccount.client_email) {
    throw new Error('Service account JSON is missing client_email');
  }

} catch (error) {
  console.error('Error with Firebase service account configuration:', error);
  throw new Error(`Firebase configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
      // Use project_id from service account instead of environment variable
      projectId: serviceAccount.project_id,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw new Error(`Failed to initialize Firebase Admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

const adminDb = getFirestore();
const adminAuth = getFirebaseAuth();

export { adminDb, adminAuth };
export default adminDb;
export const db = adminDb;
export const getAuth = () => adminAuth;