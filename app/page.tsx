"use client";


import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ParticleBackground from '@/components/ui/ParticleBackground'
import { ArrowRight, Terminal, Globe, Code, Zap, Shield, Users } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section with Particle Background */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
        <ParticleBackground count={100} color="#ffffff" />
        
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <Image 
              src="/logo.png" 
              alt="Control Logo" 
              width={120} 
              height={120} 
              className="mx-auto"
            />
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Control Your Computer with Natural Language
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The AI-powered desktop assistant that lets you control your computer and browser using natural language. <span className="text-accent font-semibold">Command is control.</span>
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/downloads" className="btn btn-primary px-8 py-3 text-lg">
              Download Now
            </Link>
            <Link href="/docs" className="btn btn-secondary px-8 py-3 text-lg">
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Control Desktop combines powerful AI with intuitive design to transform how you interact with your computer.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 p-3 bg-black rounded-full w-12 h-12 flex items-center justify-center">
                <Terminal className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Natural Language Control</h3>
              <p className="text-gray-700">
                Control your computer with simple, natural language commands. No complex syntax to remember.
              </p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="mb-4 p-3 bg-black rounded-full w-12 h-12 flex items-center justify-center">
                <Globe className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Browser Automation</h3>
              <p className="text-gray-700">
                Automate repetitive browser tasks and workflows with simple voice or text commands.
              </p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-4 p-3 bg-black rounded-full w-12 h-12 flex items-center justify-center">
                <Code className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Developer API</h3>
              <p className="text-gray-700">
                Integrate Control with your applications using our powerful API and extend functionality.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Feature 4 */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="mb-4 p-3 bg-black rounded-full w-12 h-12 flex items-center justify-center">
                <Zap className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-gray-700">
                Optimized for speed and efficiency, Control responds instantly to your commands.
              </p>
            </motion.div>
            
            {/* Feature 5 */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="mb-4 p-3 bg-black rounded-full w-12 h-12 flex items-center justify-center">
                <Shield className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Privacy Focused</h3>
              <p className="text-gray-700">
                Your data stays on your device. Control respects your privacy and security.
              </p>
            </motion.div>
            
            {/* Feature 6 */}
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="mb-4 p-3 bg-black rounded-full w-12 h-12 flex items-center justify-center">
                <Users className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Community Powered</h3>
              <p className="text-gray-700">
                Join a thriving community of users and developers extending Control's capabilities.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Control Desktop makes complex tasks simple with a powerful AI engine that understands your intent.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-soft"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Type</h3>
              <p className="text-gray-700">
                Simply tell Control what you want to do using natural language, basically just command it.
              </p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-soft"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">AI Processing</h3>
              <p className="text-gray-700">
                Control's AI engine understands your intent and converts it into actionable steps.
              </p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-soft"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black text-white font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Execution</h3>
              <p className="text-gray-700">
                Control executes the actions on your behalf, automating complex workflows in seconds.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who have transformed their workflow with Control Desktop.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              className="bg-gray-50 p-8 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                {/* <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div> */}
                <div>
                  <h4 className="font-bold">Sarah Johnson</h4>
                  <p className="text-gray-600">Software Developer</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Control has completely changed how I work. I can automate repetitive tasks with simple voice commands, saving me hours every week."
              </p>
            </motion.div>
            
            {/* Testimonial 2 */}
            <motion.div 
              className="bg-gray-50 p-8 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center mb-6">
                {/* <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div> */}
                <div>
                  <h4 className="font-bold">Michael Chen</h4>
                  <p className="text-gray-600">Product Manager</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The browser automation features are incredible. I can set up complex workflows across multiple websites with just a few commands."
              </p>
            </motion.div>
            
            {/* Testimonial 3 */}
            <motion.div 
              className="bg-gray-50 p-8 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center mb-6">
                {/* <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div> */}
                <div>
                  <h4 className="font-bold">Emily Rodriguez</h4>
                  <p className="text-gray-600">Content Creator</p>
                </div>
              </div>
              <p className="text-gray-700">
                "As someone who works with multiple applications daily, Control has been a game-changer for my productivity and creative workflow."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Download Control Desktop now and experience the future of computer interaction.
            </p>
            <Link href="/downloads" className="btn btn-accent px-8 py-3 text-lg inline-flex items-center">
              Download Now
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}