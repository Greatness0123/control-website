'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ParticleBackground from '@/components/ui/ParticleBackground';

// Community project card component
const ProjectCard = ({ 
  title, 
  description, 
  author, 
  image,
  stars,
  url,
  delay = 0 
}: { 
  title: string; 
  description: string; 
  author: string;
  image: string;
  stars: number;
  url: string;
  delay?: number;
}) => {
  return (
    <motion.div 
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg overflow-hidden hover:bg-opacity-10 transition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link href={url} target="_blank" rel="noopener noreferrer">
        <div className="relative h-48 w-full">
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-300 mb-4">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">By {author}</span>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
              </svg>
              <span className="text-sm">{stars}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Community member card component
const MemberCard = ({ 
  name, 
  role, 
  contributions,
  image,
  delay = 0 
}: { 
  name: string; 
  role: string; 
  contributions: number;
  image: string;
  delay?: number;
}) => {
  return (
    <motion.div 
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 flex flex-col items-center text-center hover:bg-opacity-10 transition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="w-20 h-20 rounded-full overflow-hidden relative mb-4">
        <Image 
          src={image} 
          alt={name} 
          fill 
          className="object-cover"
        />
      </div>
      <h3 className="text-lg font-bold mb-1">{name}</h3>
      <p className="text-gray-300 text-sm mb-3">{role}</p>
      <div className="text-sm">
        <span className="text-gray-400">{contributions} contributions</span>
      </div>
    </motion.div>
  );
};

// Event card component
const EventCard = ({ 
  title, 
  date, 
  location,
  virtual,
  url,
  delay = 0 
}: { 
  title: string; 
  date: string; 
  location: string;
  virtual: boolean;
  url: string;
  delay?: number;
}) => {
  return (
    <motion.div 
      className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 hover:bg-opacity-10 transition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-gray-300 mb-1">{date}</p>
          <p className="text-gray-400 text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location} {virtual && <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-10 rounded-full text-xs">Virtual</span>}
          </p>
        </div>
        <Link href={url} className="bg-white bg-opacity-10 hover:bg-opacity-20 transition px-3 py-1 rounded text-sm">
          Details
        </Link>
      </div>
    </motion.div>
  );
};

// Forum topic component
const ForumTopic = ({ 
  title, 
  author, 
  replies,
  views,
  lastActivity,
  url,
  delay = 0 
}: { 
  title: string; 
  author: string; 
  replies: number;
  views: number;
  lastActivity: string;
  url: string;
  delay?: number;
}) => {
  return (
    <motion.div 
      className="border-b border-white border-opacity-10 py-4 hover:bg-white hover:bg-opacity-5 transition px-4 -mx-4 rounded"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Link href={url} className="flex items-center justify-between">
        <div>
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm text-gray-400">By {author} • Last activity {lastActivity}</p>
        </div>
        <div className="text-sm text-gray-400">
          <span className="mr-4">{replies} replies</span>
          <span>{views} views</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default function CommunityPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('showcase');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Sample community projects
  const projects = [
    {
      title: "Control AI VSCode Extension",
      description: "Integrate Control AI directly into your VSCode environment for seamless coding assistance.",
      author: "devMaster42",
      image: "/images/blog-post-3.jpg",
      stars: 128,
      url: "#"
    },
    {
      title: "Control AI Dashboard",
      description: "A beautiful alternative dashboard for monitoring your Control AI usage and analytics.",
      author: "uiWizard",
      image: "/images/blog-post-1.jpg",
      stars: 87,
      url: "#"
    },
    {
      title: "Python SDK for Control AI",
      description: "A comprehensive Python SDK for interacting with the Control AI API.",
      author: "pythonista",
      image: "/images/blog-post-2.jpg",
      stars: 215,
      url: "#"
    },
    {
      title: "Control AI CLI Tool",
      description: "Access Control AI capabilities directly from your terminal with this powerful CLI.",
      author: "terminalNinja",
      image: "/images/blog-post-5.jpg",
      stars: 156,
      url: "#"
    },
    {
      title: "React Component Library",
      description: "A set of React components for building Control AI-powered interfaces.",
      author: "reactDev",
      image: "/images/blog-post-4.jpg",
      stars: 94,
      url: "#"
    },
    {
      title: "Control AI for Figma",
      description: "A Figma plugin that brings Control AI capabilities to your design workflow.",
      author: "designPro",
      image: "/images/blog-post-6.jpg",
      stars: 72,
      url: "#"
    }
  ];

  // Sample community members
  const members = [
    {
      name: "Alex Chen",
      role: "Core Contributor",
      contributions: 347,
      image: "/images/blog-post-1.jpg"
    },
    {
      name: "Sarah Johnson",
      role: "Documentation Lead",
      contributions: 215,
      image: "/images/blog-post-2.jpg"
    },
    {
      name: "Michael Wong",
      role: "Plugin Developer",
      contributions: 189,
      image: "/images/blog-post-3.jpg"
    },
    {
      name: "Emily Rodriguez",
      role: "Community Moderator",
      contributions: 156,
      image: "/images/blog-post-4.jpg"
    }
  ];

  // Sample events
  const events = [
    {
      title: "Control AI Community Meetup",
      date: "October 15, 2025",
      location: "San Francisco, CA",
      virtual: true,
      url: "#"
    },
    {
      title: "Workshop: Building Custom Commands",
      date: "October 22, 2025",
      location: "Online",
      virtual: true,
      url: "#"
    },
    {
      title: "Control AI Developer Conference",
      date: "November 5-7, 2025",
      location: "New York, NY",
      virtual: false,
      url: "#"
    }
  ];

  // Sample forum topics
  const forumTopics = [
    {
      title: "How to optimize Control AI for large codebases?",
      author: "devMaster42",
      replies: 24,
      views: 1256,
      lastActivity: "2 hours ago",
      url: "#"
    },
    {
      title: "Custom command for data visualization not working",
      author: "dataViz",
      replies: 18,
      views: 876,
      lastActivity: "5 hours ago",
      url: "#"
    },
    {
      title: "Integrating Control AI with Notion - any tips?",
      author: "productivityGuru",
      replies: 32,
      views: 1542,
      lastActivity: "1 day ago",
      url: "#"
    },
    {
      title: "Feature request: Support for custom AI models",
      author: "aiResearcher",
      replies: 47,
      views: 2103,
      lastActivity: "2 days ago",
      url: "#"
    },
    {
      title: "Control AI performance on M1 Mac",
      author: "macUser",
      replies: 15,
      views: 943,
      lastActivity: "3 days ago",
      url: "#"
    }
  ];

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Community</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of developers and creators building with Control AI.
          </p>
        </motion.div>

        {/* Community stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <motion.div 
            className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="text-3xl font-bold mb-2">10K+</div>
            <div className="text-gray-300">Community Members</div>
          </motion.div>
          <motion.div 
            className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="text-3xl font-bold mb-2">500+</div>
            <div className="text-gray-300">Open Source Projects</div>
          </motion.div>
          <motion.div 
            className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="text-3xl font-bold mb-2">250+</div>
            <div className="text-gray-300">Custom Commands</div>
          </motion.div>
          <motion.div 
            className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="text-3xl font-bold mb-2">50+</div>
            <div className="text-gray-300">Global Events</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white border-opacity-10 mb-8">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'showcase' ? 'border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('showcase')}
          >
            Project Showcase
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'forum' ? 'border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('forum')}
          >
            Discussion Forum
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'events' ? 'border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'contributors' ? 'border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('contributors')}
          >
            Contributors
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'showcase' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Featured Projects</h2>
              <Link href="#" className="text-sm hover:underline">
                Submit your project →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <ProjectCard 
                  key={index}
                  title={project.title}
                  description={project.description}
                  author={project.author}
                  image={project.image}
                  stars={project.stars}
                  url={project.url}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'forum' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Recent Discussions</h2>
              <Link href="#" className="text-sm hover:underline">
                Start a new topic →
              </Link>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-6">
              {forumTopics.map((topic, index) => (
                <ForumTopic 
                  key={index}
                  title={topic.title}
                  author={topic.author}
                  replies={topic.replies}
                  views={topic.views}
                  lastActivity={topic.lastActivity}
                  url={topic.url}
                  delay={index * 0.1}
                />
              ))}
              <div className="mt-6 text-center">
                <Link href="#" className="text-sm hover:underline">
                  View all discussions →
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <Link href="#" className="text-sm hover:underline">
                View calendar →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <EventCard 
                  key={index}
                  title={event.title}
                  date={event.date}
                  location={event.location}
                  virtual={event.virtual}
                  url={event.url}
                  delay={index * 0.1}
                />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="#" className="bg-white bg-opacity-10 hover:bg-opacity-20 transition px-6 py-3 rounded-lg inline-block">
                Host an event
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'contributors' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Top Contributors</h2>
              <Link href="#" className="text-sm hover:underline">
                How to contribute →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {members.map((member, index) => (
                <MemberCard 
                  key={index}
                  name={member.name}
                  role={member.role}
                  contributions={member.contributions}
                  image={member.image}
                  delay={index * 0.1}
                />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="#" className="bg-white bg-opacity-10 hover:bg-opacity-20 transition px-6 py-3 rounded-lg inline-block">
                Join the community
              </Link>
            </div>
          </div>
        )}

        {/* Join community CTA */}
        <motion.div 
          className="mt-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-lg p-8 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Our Discord Community</h2>
            <p className="text-gray-300 mb-6">
              Connect with other Control AI users, get help, share your projects, and stay updated on the latest developments.
            </p>
            <Link href="#" className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}