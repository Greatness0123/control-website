'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ParticleBackground from '@/components/ui/ParticleBackground';

// Blog post card component
const BlogPostCard = ({ 
  title, 
  excerpt, 
  image, 
  date, 
  author,
  slug,
  delay = 0 
}: { 
  title: string; 
  excerpt: string; 
  image: string;
  date: string;
  author: string;
  slug: string;
  delay?: number;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg overflow-hidden hover:bg-opacity-10 transition"
    >
      <Link href={`/blog/${slug}`}>
        <div className="relative h-48 w-full">
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center text-sm text-gray-400 mb-3">
            <span>{date}</span>
            <span className="mx-2">•</span>
            <span>{author}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-300">{excerpt}</p>
          <div className="mt-4 text-sm font-medium">
            Read more →
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Featured post component
const FeaturedPost = ({
  title,
  excerpt,
  image,
  date,
  author,
  slug
}: {
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  slug: string;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg overflow-hidden mb-16"
    >
      <Link href={`/blog/${slug}`} className="flex flex-col md:flex-row">
        <div className="md:w-1/2 relative h-64 md:h-auto">
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover"
          />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <div className="text-sm text-gray-400 mb-3">
            <span>{date}</span>
            <span className="mx-2">•</span>
            <span>{author}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
          <p className="text-gray-300 mb-6">{excerpt}</p>
          <div className="text-sm font-medium">
            Read full article →
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Category pill component
const CategoryPill = ({ 
  name, 
  active = false,
  onClick
}: { 
  name: string;
  active?: boolean;
  onClick: () => void;
}) => {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        active 
          ? 'bg-white text-black' 
          : 'bg-white bg-opacity-5 hover:bg-opacity-10'
      }`}
    >
      {name}
    </button>
  );
};

export default function BlogPage() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Sample blog posts data
  const featuredPost = {
    title: "Introducing Control AI: The Future of Desktop Assistance",
    excerpt: "Today, we're excited to announce the launch of Control AI, a revolutionary desktop assistant that seamlessly integrates with your workflow and provides intelligent assistance across all your applications.",
    image: "/images/featured-post.jpg",
    date: "September 20, 2025",
    author: "Alex Chen, Founder",
    slug: "introducing-control-ai"
  };

  const blogPosts = [
    {
      title: "5 Ways Control AI Boosts Developer Productivity",
      excerpt: "Discover how Control AI can transform your coding workflow with intelligent assistance, code generation, and documentation help.",
      image: "/images/blog-post-1.jpg",
      date: "September 15, 2025",
      author: "Sarah Johnson",
      slug: "boost-developer-productivity",
      category: "Development"
    },
    {
      title: "Advanced Data Analysis with Natural Language Queries",
      excerpt: "Learn how to analyze complex datasets using simple natural language queries with Control AI's data analysis capabilities.",
      image: "/images/blog-post-2.jpg",
      date: "September 10, 2025",
      author: "Michael Wong",
      slug: "data-analysis-natural-language",
      category: "Data Science"
    },
    {
      title: "Creating Custom Commands for Your Workflow",
      excerpt: "A step-by-step guide to creating personalized commands that automate repetitive tasks and streamline your workflow.",
      image: "/images/blog-post-3.jpg",
      date: "September 5, 2025",
      author: "Emily Rodriguez",
      slug: "custom-commands-workflow",
      category: "Productivity"
    },
    {
      title: "Control AI for Content Creators: A Complete Guide",
      excerpt: "How writers, designers, and marketers can leverage Control AI to enhance their creative process and produce better content.",
      image: "/images/blog-post-4.jpg",
      date: "August 30, 2025",
      author: "David Kim",
      slug: "content-creators-guide",
      category: "Creativity"
    },
    {
      title: "Integrating Control AI with Your Existing Tools",
      excerpt: "Learn how to connect Control AI with your favorite applications and services for a seamless workflow experience.",
      image: "/images/blog-post-5.jpg",
      date: "August 25, 2025",
      author: "Lisa Chen",
      slug: "integrating-existing-tools",
      category: "Integration"
    },
    {
      title: "The Technology Behind Control AI's Natural Language Processing",
      excerpt: "A deep dive into the advanced NLP technologies that power Control AI's understanding of natural language commands.",
      image: "/images/blog-post-6.jpg",
      date: "August 20, 2025",
      author: "Robert Taylor",
      slug: "nlp-technology-explained",
      category: "Technology"
    }
  ];

  const categories = ['All', 'Development', 'Data Science', 'Productivity', 'Creativity', 'Integration', 'Technology'];
  
  const filteredPosts = activeCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Blog</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Insights, tutorials, and updates from the Control AI team.
          </p>
        </motion.div>

        {/* Featured post */}
        <FeaturedPost {...featuredPost} />
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((category, index) => (
            <CategoryPill 
              key={index} 
              name={category} 
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            />
          ))}
        </div>
        
        {/* Blog posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <BlogPostCard 
              key={index}
              title={post.title}
              excerpt={post.excerpt}
              image={post.image}
              date={post.date}
              author={post.author}
              slug={post.slug}
              delay={index * 0.1}
            />
          ))}
        </div>
        
        {/* Newsletter signup */}
        <motion.div 
          className="mt-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-8 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-6">
              Subscribe to our newsletter to receive the latest updates, tutorials, and insights about Control AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
              />
              <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}