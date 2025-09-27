# Firebase Firestore Indexes Configuration

## Required Indexes for Control AI Platform

The dashboard is showing errors because Firestore requires specific composite indexes for the queries being executed. Here are the indexes you need to create:

### 1. API Keys Index

**Collection:** `api_keys`  
**Fields:** 
- `user_id` (ASC)
- `created_at` (DESC)

**Firebase Console URL:**  
```
https://console.firebase.google.com/v1/r/project/control-ai-desktop/firestore/indexes?create_composite=ClNwcm9qZWN0cy9jb250cm9sLWFpLWRlc2t0b3AvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2FwaV9rZXlzL2luZGV4ZXMvXxABGgsKB3VzZXJfaWQQARoOCgpjcmVhdGVkX2F0EAIaDAoIX19uYW1lX18QAg
```

### 2. Usage Data Index

**Collection:** `usage`  
**Fields:**
- `user_id` (ASC)
- `date` (ASC)

**Firebase Console URL:**
```
https://console.firebase.google.com/v1/r/project/control-ai-desktop/firestore/indexes?create_composite=ClBwcm9qZWN0cy9jb250cm9sLWFpLWRlc2t0b3AvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3VzYWdlL2luZGV4ZXMvXxABGgsKB3VzZXJfaWQQARoICgRkYXRlEAEaDAoIX19uYW1lX18QAQ
```

## How to Create These Indexes

### Option 1: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Add Index**
5. Configure each index as specified above

### Option 2: Firebase CLI (Recommended)

Create a `firestore.indexes.json` file in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "api_keys",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "user_id",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "created_at",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "usage",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "user_id",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy the indexes:

```bash
firebase deploy --only firestore:indexes
```

### Option 3: Firebase Admin SDK (Programmatic)

You can also create indexes programmatically using the Firebase Admin SDK.

## Additional Recommended Indexes

For better performance, consider adding these indexes as well:

### 3. Usage Logs Index
```json
{
  "collectionGroup": "usage_logs",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "uid",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "timestamp",
      "order": "DESCENDING"
    }
  ]
}
```

### 4. Model Usage Index
```json
{
  "collectionGroup": "model_usage",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "user_id",
      "order": "ASCENDING"
    }
  ]
}
```

## Troubleshooting

### Index Creation Time
- **Single-field indexes**: Created automatically, immediate effect
- **Composite indexes**: Can take a few minutes to create
- **Large collections**: May take longer for initial build

### Cost Considerations
- Each composite index costs approximately $0.01 per 100,000 documents per month
- Only create indexes you actually need
- Monitor your Firestore usage in the Firebase Console

### Verification
After creating the indexes, you can verify they're working by:

1. Checking the Firebase Console Indexes tab
2. Testing the dashboard queries
3. Monitoring the Firestore usage tab for query performance

## Security Rules

Make sure your Firestore security rules allow these queries. Example rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // API Keys
    match /api_keys/{keyId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
    }
    
    // Usage Data
    match /usage/{usageId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
  }
}
```

## Support

If you continue to experience issues:
1. Check the Firebase Console for index status
2. Review Firestore query performance
3. Verify security rules allow the queries
4. Contact Firebase support if needed