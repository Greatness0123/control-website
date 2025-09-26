'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

// Define the pricing plans
const plans = [
  {
    name: 'Free',
    description: 'Basic access for personal projects and testing',
    price: 0,
    features: [
      '10,000 tokens per month',
      '10 requests per minute',
      'GPT-3.5 Turbo access',
      'Basic support',
      'Single API key',
    ],
    limitations: [
      'No GPT-4 access',
      'No priority routing',
      'No custom models',
    ],
    cta: 'Get Started',
    ctaLink: '/signup',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Enhanced access for businesses and power users',
    price: 49.99,
    features: [
      '1,000,000 tokens per month',
      '60 requests per minute',
      'GPT-4 access',
      'Priority support',
      'Multiple API keys',
      'Advanced analytics',
      'Custom rate limits',
    ],
    limitations: [],
    cta: 'Subscribe Now',
    ctaLink: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Pay As You Go',
    description: 'Flexible usage with no monthly commitment',
    price: 0,
    priceDetail: '$0.01 per 1,000 tokens',
    features: [
      'Pay only for what you use',
      '30 requests per minute',
      'GPT-4 access',
      'Standard support',
      'Multiple API keys',
      'Usage analytics',
    ],
    limitations: [
      'No priority routing',
    ],
    cta: 'Start Now',
    ctaLink: '/signup?plan=payg',
    popular: false,
  },
];

// Token pack options
const tokenPacks = [
  {
    name: 'Starter Pack',
    tokens: '100,000',
    price: 9.99,
    cta: 'Buy Now',
    ctaLink: '/dashboard/billing/buy?pack=starter',
  },
  {
    name: 'Pro Pack',
    tokens: '500,000',
    price: 39.99,
    cta: 'Buy Now',
    ctaLink: '/dashboard/billing/buy?pack=pro',
    popular: true,
  },
  {
    name: 'Enterprise Pack',
    tokens: '2,000,000',
    price: 149.99,
    cta: 'Buy Now',
    ctaLink: '/dashboard/billing/buy?pack=enterprise',
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="container mx-auto px-4 text-center mb-16">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Choose the plan that works best for your needs. All plans include access to our API.
        </motion.p>
        
        {/* Billing Cycle Toggle */}
        <motion.div 
          className="flex justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gray-100 p-1 rounded-full flex items-center">
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-white shadow-soft text-black' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'annual' 
                  ? 'bg-white shadow-soft text-black' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual <span className="text-xs text-accent">Save 20%</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Pricing Plans */}
      <div className="container mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`rounded-2xl overflow-hidden border ${
                plan.popular 
                  ? 'border-black shadow-lg relative' 
                  : 'border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              {plan.popular && (
                <div className="bg-black text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {billingCycle === 'monthly' ? (
                    <span className="text-gray-600">/month</span>
                  ) : (
                    <span className="text-gray-600">/year</span>
                  )}
                  {plan.priceDetail && (
                    <div className="text-sm text-gray-600 mt-1">{plan.priceDetail}</div>
                  )}
                </div>
                <Link
                  href={plan.ctaLink}
                  className={`block w-full py-3 rounded-xl text-center font-medium mb-8 ${
                    plan.popular 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'bg-white border border-black text-black hover:bg-gray-100'
                  }`}
                >
                  {plan.cta}
                </Link>
                <div className="space-y-4">
                  <p className="font-medium">Includes:</p>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start">
                      <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.length > 0 && (
                    <>
                      <p className="font-medium mt-6">Limitations:</p>
                      {plan.limitations.map((limitation) => (
                        <div key={limitation} className="flex items-start">
                          <X className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                          <span>{limitation}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Token Packs */}
      <div className="container mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Token Packs
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Need more tokens? Purchase a token pack to top up your account.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tokenPacks.map((pack, index) => (
            <motion.div
              key={pack.name}
              className={`rounded-2xl overflow-hidden border ${
                pack.popular 
                  ? 'border-black shadow-lg relative' 
                  : 'border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              {pack.popular && (
                <div className="bg-black text-white text-center py-2 text-sm font-medium">
                  Best Value
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{pack.name}</h3>
                <div className="text-gray-600 mb-6">{pack.tokens} tokens</div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${pack.price}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    ${(pack.price / parseInt(pack.tokens.replace(/,/g, '')) * 1000).toFixed(3)} per 1,000 tokens
                  </div>
                </div>
                <Link
                  href={pack.ctaLink}
                  className={`block w-full py-3 rounded-xl text-center font-medium ${
                    pack.popular 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'bg-white border border-black text-black hover:bg-gray-100'
                  }`}
                >
                  {pack.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-bold mb-2">What are tokens?</h3>
            <p className="text-gray-600">
              Tokens are the units of measurement for API usage. Each API request consumes tokens based on the length of the input and output. Roughly speaking, 1 token is approximately 4 characters or 0.75 words.
            </p>
          </motion.div>

          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-2">How do I know which plan is right for me?</h3>
            <p className="text-gray-600">
              If you're just getting started, the Free plan is perfect for testing and small projects. For production use or higher volume needs, the Professional plan offers the best value. If your usage varies month to month, the Pay As You Go plan provides flexibility.
            </p>
          </motion.div>

          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-2">Can I change plans later?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade, downgrade, or switch between plans at any time. Changes take effect at the start of your next billing cycle.
            </p>
          </motion.div>

          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-2">How does billing work for Pay As You Go?</h3>
            <p className="text-gray-600">
              With Pay As You Go, you'll only be charged for the tokens you use. We'll keep track of your usage throughout the month and bill you at the end of your billing cycle. You can also purchase token packs to pre-pay for usage.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-2">Do you offer custom enterprise plans?</h3>
            <p className="text-gray-600">
              Yes, we offer custom enterprise plans for organizations with specific needs or higher volume requirements. Please <Link href="/contact" className="text-accent hover:underline">contact us</Link> to discuss your requirements.
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4">
        <motion.div 
          className="bg-black text-white rounded-2xl p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Sign up now and get started with a free account. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors"
          >
            Create Free Account
          </Link>
        </motion.div>
      </div>
    </div>
  );
}