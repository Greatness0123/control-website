import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';

// Parse the service account JSON string from environment variable
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
} catch (error) {
  console.error('Error parsing Firebase service account JSON:', error);
  throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const adminDb = getFirestore();
const adminAuth = getFirebaseAuth();

export { adminDb, adminAuth };
export default adminDb;
export const db = adminDb;
export const getAuth = () => adminAuth;