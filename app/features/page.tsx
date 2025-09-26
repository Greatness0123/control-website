'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { motion } from 'framer-motion';

// Feature card component
const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  delay = 0 
}: { 
  title: string; 
  description: string; 
  icon: string;
  delay?: number;
}) => {
  return (
    <motion.div 
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 hover:bg-opacity-10 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 mr-3 flex items-center justify-center bg-white bg-opacity-10 rounded-full">
          <span className="text-xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  );
};

// Comparison table component
const ComparisonTable = () => {
  return (
    <div className="w-full overflow-x-auto mt-16 mb-16">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white border-opacity-10">
            <th className="py-4 px-6 text-left">Features</th>
            <th className="py-4 px-6 text-center">Control AI</th>
            <th className="py-4 px-6 text-center">Competitors</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white border-opacity-10">
            <td className="py-4 px-6">Desktop Integration</td>
            <td className="py-4 px-6 text-center">✓</td>
            <td className="py-4 px-6 text-center">Limited</td>
          </tr>
          <tr className="border-b border-white border-opacity-10">
            <td className="py-4 px-6">API Access</td>
            <td className="py-4 px-6 text-center">✓</td>
            <td className="py-4 px-6 text-center">✓</td>
          </tr>
          <tr className="border-b border-white border-opacity-10">
            <td className="py-4 px-6">Custom Commands</td>
            <td className="py-4 px-6 text-center">✓</td>
            <td className="py-4 px-6 text-center">Limited</td>
          </tr>
          <tr className="border-b border-white border-opacity-10">
            <td className="py-4 px-6">System-wide Shortcuts</td>
            <td className="py-4 px-6 text-center">✓</td>
            <td className="py-4 px-6 text-center">×</td>
          </tr>
          <tr className="border-b border-white border-opacity-10">
            <td className="py-4 px-6">Offline Capabilities</td>
            <td className="py-4 px-6 text-center">Partial</td>
            <td className="py-4 px-6 text-center">×</td>
          </tr>
          <tr className="border-b border-white border-opacity-10">
            <td className="py-4 px-6">Multi-model Support</td>
            <td className="py-4 px-6 text-center">✓</td>
            <td className="py-4 px-6 text-center">Limited</td>
          </tr>
          <tr className="border-b border-white border-opacity-10">
            <td className="py-4 px-6">Usage-based Pricing</td>
            <td className="py-4 px-6 text-center">✓</td>
            <td className="py-4 px-6 text-center">Subscription Only</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Use case component
const UseCase = ({ 
  title, 
  description, 
  image,
  reverse = false,
  delay = 0
}: { 
  title: string; 
  description: string; 
  image: string;
  reverse?: boolean;
  delay?: number;
}) => {
  return (
    <motion.div 
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 my-16`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
    >
      <div className="flex-1">
        <div className="relative h-64 md:h-full rounded-lg overflow-hidden border border-white border-opacity-10">
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover"
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </motion.div>
  );
};

export default function FeaturesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Powerful Features</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Control AI transforms how you interact with your computer, providing intelligent assistance across your entire workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <FeatureCard 
            title="Desktop Integration" 
            description="Control seamlessly integrates with your desktop environment, providing assistance across all applications."
            icon="🖥️"
            delay={0.1}
          />
          <FeatureCard 
            title="Natural Language Commands" 
            description="Communicate with your computer using natural language instead of complex command structures."
            icon="💬"
            delay={0.2}
          />
          <FeatureCard 
            title="Custom Workflows" 
            description="Create personalized automation workflows tailored to your specific needs and preferences."
            icon="⚙️"
            delay={0.3}
          />
          <FeatureCard 
            title="Multi-model Support" 
            description="Access various AI models through a unified interface, selecting the best tool for each task."
            icon="🧠"
            delay={0.4}
          />
          <FeatureCard 
            title="API Access" 
            description="Integrate Control's capabilities into your own applications with our developer-friendly API."
            icon="🔌"
            delay={0.5}
          />
          <FeatureCard 
            title="Privacy Focused" 
            description="Your data stays on your device whenever possible, with transparent handling of cloud processing."
            icon="🔒"
            delay={0.6}
          />
        </div>

        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Control Compares</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how Control AI stands out from other AI assistants in the market.
          </p>
        </motion.div>

        <ComparisonTable />

        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Use Cases</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover how Control AI can transform your workflow across different scenarios.
          </p>
        </motion.div>

        <UseCase 
          title="Content Creation" 
          description="Control AI assists writers, designers, and creators by providing real-time suggestions, generating content ideas, and automating repetitive tasks. From drafting emails to creating design assets, Control enhances your creative process."
          image="/images/content-creation.jpg"
          delay={0.9}
        />
        
        <UseCase 
          title="Software Development" 
          description="Accelerate your coding workflow with intelligent code completion, documentation generation, and debugging assistance. Control integrates with your IDE to provide contextual help exactly when you need it."
          image="/images/developer-productivity.jpg"
          reverse={true}
          delay={1.0}
        />
        
        <UseCase 
          title="Data Analysis" 
          description="Transform how you work with data by using natural language to query, visualize, and interpret complex datasets. Control helps you extract insights without needing to remember complex syntax or commands."
          image="/images/data-analysis.jpg"
          delay={1.1}
        />
        
        {/* CTA Section */}
        <motion.div 
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your workflow?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of professionals who have already enhanced their productivity with Control AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/pricing" className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition">
                View Pricing
              </a>
              <a href="/downloads" className="bg-transparent border border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition">
                Download Now
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}