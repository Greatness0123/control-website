# Control Platform

![Control Logo](public/logo.png)

Control Platform is the official web presence and developer gateway for **Control Desktop** — an AI-powered desktop assistant that lets users control their computer and browser using natural language.

## Features

- **Website**: Marketing pages, documentation, and downloads for Control Desktop
- **Developer API Gateway**: Secure API access to Control's AI capabilities
- **Admin Portal**: Comprehensive admin dashboard for managing users, API keys, and monitoring usage
- **User Dashboard**: Self-service portal for users to manage their API keys and billing

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes (serverless)
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Caching & Rate Limiting**: Redis (Upstash)
- **AI Provider**: OpenRouter
- **Payments**: Flutterwave (primary), Stripe (optional)
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Upstash Redis account
- OpenRouter API key(s)
- Flutterwave account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/control-platform.git
   cd control-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. Fill in the environment variables in the `.env` file (see Environment Variables section below).

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Environment Variables

The following environment variables are required for the application to function properly:

### Firebase Configuration
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key (from Firebase console)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID

### Firebase Admin
- `FIREBASE_SERVICE_ACCOUNT`: JSON string of your Firebase service account (from Firebase console → Project settings → Service accounts → Generate new private key)

### Flutterwave Configuration
- `NEXT_PUBLIC_FLW_PUBLIC_KEY`: Your Flutterwave public key
- `FLW_SECRET_KEY`: Your Flutterwave secret key
- `FLW_WEBHOOK_SECRET`: Your Flutterwave webhook secret (verif-hash)

### OpenRouter API Keys
- `OPENROUTER_KEY_1`: Your primary OpenRouter API key
- `OPENROUTER_KEY_2`: Your secondary OpenRouter API key (optional)
- `OPENROUTER_KEY_3`: Your tertiary OpenRouter API key (optional)

### Redis Configuration
- `REDIS_URL`: Your Upstash Redis URL (including authentication)

### Application URL
- `NEXT_PUBLIC_APP_URL`: The URL where your application is hosted (e.g., http://localhost:3000 for development)

### NextAuth Secret
- `NEXTAUTH_SECRET`: A random string for NextAuth.js session encryption

### Optional Stripe Keys (for future implementation)
- `STRIPE_PUBLIC_KEY`: Your Stripe public key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret

## Project Structure

```
control-platform/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── ai/             # AI proxy endpoint
│   │   ├── admin/          # Admin API endpoints
│   │   ├── flutterwave/    # Payment endpoints
│   │   └── cron/           # Scheduled jobs
│   ├── admin/              # Admin portal pages
│   ├── dashboard/          # User dashboard pages
│   └── ...                 # Marketing and other pages
├── components/             # React components
│   ├── admin/              # Admin-specific components
│   ├── dashboard/          # Dashboard components
│   ├── layout/             # Layout components
│   └── ui/                 # UI components
├── lib/                    # Utility functions and services
│   ├── api/                # API utilities
│   ├── auth/               # Authentication utilities
│   ├── firebase/           # Firebase configuration
│   ├── flutterwave/        # Flutterwave integration
│   ├── openrouter/         # OpenRouter client
│   └── redis/              # Redis client
├── public/                 # Static assets
├── scripts/                # Utility scripts
│   └── seedFirestore.js    # Database seeding script
└── tests/                  # Test files
```

## Database Seeding

To initialize your Firestore database with sample data:

1. Ensure your `.env` file is properly configured with Firebase credentials.

2. Run the seed script:
   ```bash
   npm run seed
   ```

This will create:
- Sample tiers (free, pro, pay-as-you-go)
- Sample OpenRouter keys configuration
- A sample admin user
- A sample API key

## Creating Your First Admin User

After running the seed script:

1. Go to the Firebase console and create a user with the email `admin@control.com` (or the email you specified in the seed script).

2. Sign in to the application with this user.

3. The user will automatically have admin privileges based on the Firestore document created by the seed script.

## API Documentation

### Core API: POST /api/ai

The main API endpoint for AI requests:

```javascript
// Request
POST /api/ai
{
  "api_key": "ctrl-xxxxxxxxxxxxxxxx",
  "prompt": "Your prompt here",
  "options": {
    "model": "openai/gpt-4", // Optional, defaults to tier's default model
    "max_tokens": 1000,      // Optional
    "temperature": 0.7,      // Optional
    "top_p": 1,              // Optional
    "stream": false,         // Optional
    "stop": []               // Optional
  }
}

// Success Response
{
  "id": "response-id",
  "object": "chat.completion",
  "created": 1625097600,
  "model": "openai/gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The response text"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## Rate Limiting and Quotas

- **Free tier**: 10 requests per minute, 10,000 tokens per month
- **Pro tier**: 60 requests per minute, 1,000,000 tokens per month
- **Pay-as-you-go tier**: 30 requests per minute, no monthly quota (pay per token)

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository.

2. Connect your repository to Vercel.

3. Configure the environment variables in Vercel.

4. Deploy!

### Health Check Configuration

Set up a cron job to run the health check endpoint regularly:

1. In Vercel, go to Settings → Cron Jobs.

2. Add a new cron job:
   - Name: OpenRouter Health Check
   - Path: /api/cron/healthcheck
   - Schedule: */5 * * * * (every 5 minutes)
   - HTTP Method: GET
   - Headers: Authorization: Bearer YOUR_CRON_SECRET

## OpenRouter Key Management

### Adding a New OpenRouter Key

1. Add the key to your environment variables:
   ```
   OPENROUTER_KEY_X=your-new-key
   ```

2. Add the key to Firestore through the admin portal:
   - Go to Admin → OpenRouter Keys
   - Click "Add Key"
   - Enter the ID (matching the environment variable index)
   - Enter the environment variable name (e.g., OPENROUTER_KEY_X)
   - Add optional notes

### Key Rotation Strategy

For production, implement a key rotation strategy:

1. Add a new key to your environment variables and Firestore.
2. Wait for the health check to verify the new key is working.
3. Remove or disable the old key.

## Testing

Run the test suite with:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## MVP Simplifications and TODOs for Production

1. **OpenRouter Integration**: Currently using a simplified round-robin approach. For production, implement more sophisticated load balancing and failover strategies.

2. **Rate Limiting**: Current implementation uses basic Redis counters. For production, consider more sophisticated token bucket algorithms.

3. **Error Handling**: Add more comprehensive error handling and logging throughout the application.

4. **Monitoring**: Integrate with a monitoring solution like Datadog, New Relic, or Sentry.

5. **Testing**: Increase test coverage, especially for critical API endpoints and billing logic.

6. **Security**: Implement additional security measures like rate limiting by IP, CORS configuration, and more comprehensive input validation.

7. **Billing**: Implement more sophisticated billing features like invoices, receipts, and automatic payment reminders.

8. **Caching**: Add more aggressive caching for static content and API responses where appropriate.

9. **Analytics**: Implement more comprehensive analytics for user behavior and API usage.

10. **Documentation**: Expand API documentation with more examples and use cases.