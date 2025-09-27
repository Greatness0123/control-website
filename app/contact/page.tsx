'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin, Send, Github, Twitter, Linkedin } from 'lucide-react';

// Form state interface
interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Form errors interface
interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  // Form state
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formState.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!formState.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formState.subject.trim()) {
      errors.subject = 'Subject is required';
      isValid = false;
    }

    if (!formState.message.trim()) {
      errors.message = 'Message is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // In a real application, you would send this data to your API
      // For now, we'll simulate a successful submission after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Reset form on success
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      setSubmitSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Get in Touch
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Have questions or feedback? We'd love to hear from you. Our team is here to help.
        </motion.p>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-black text-white p-8 rounded-2xl h-full">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <a href="mailto:support@control.ai" className="text-gray-300 hover:text-white transition-colors">
                      support@control.ai
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <a href="tel:+1-800-123-4567" className="text-gray-300 hover:text-white transition-colors">
                      +1 (800) 123-4567
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium">Office</h3>
                    <address className="text-gray-300 not-italic">
                      123 AI Boulevard<br />
                      San Francisco, CA 94107<br />
                      United States
                    </address>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MessageSquare className="mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-gray-300">
                      Available Monday to Friday<br />
                      9:00 AM - 6:00 PM PST
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="font-medium mb-4">Connect with us</h3>
                <div className="flex space-x-4">
                  <a href="https://github.com/control-ai" target="_blank" rel="noopener noreferrer" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <Github size={20} />
                    <span className="sr-only">GitHub</span>
                  </a>
                  <a href="https://twitter.com/control_ai" target="_blank" rel="noopener noreferrer" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <Twitter size={20} />
                    <span className="sr-only">Twitter</span>
                  </a>
                  <a href="https://linkedin.com/company/control-ai" target="_blank" rel="noopener noreferrer" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <Linkedin size={20} />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div> */}

          {/* Contact Form */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white p-8 rounded-2xl shadow-soft">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6">
                  Thank you for your message! We'll get back to you as soon as possible.
                </div>
              )}
              
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6">
                  {submitError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      className={`form-input ${formErrors.name ? 'border-red-500' : ''}`}
                      placeholder="John Doe"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      className={`form-input ${formErrors.email ? 'border-red-500' : ''}`}
                      placeholder="john@example.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                </div>
                
                {/* Subject */}
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    className={`form-input ${formErrors.subject ? 'border-red-500' : ''}`}
                    placeholder="How can we help you?"
                  />
                  {formErrors.subject && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>
                  )}
                </div>
                
                {/* Message */}
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formState.message}
                    onChange={handleChange}
                    className={`form-input resize-none ${formErrors.message ? 'border-red-500' : ''}`}
                    placeholder="Your message here..."
                  ></textarea>
                  {formErrors.message && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.message}</p>
                  )}
                </div>
                
                {/* Submit Button */}
                <div className="text-right">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2" size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
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
            <h3 className="text-xl font-bold mb-2">How quickly can I expect a response?</h3>
            <p className="text-gray-600">
              We typically respond to all inquiries within 24 hours during business days. For urgent matters, please indicate this in your subject line.
            </p>
          </motion.div>

          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-2">Do you offer technical support?</h3>
            <p className="text-gray-600">
              Yes, we offer technical support for all our users. Free users receive basic email support, while paid subscribers get priority support with faster response times.
            </p>
          </motion.div>

          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-2">How can I report a bug?</h3>
            <p className="text-gray-600">
              You can report bugs through this contact form or by emailing support@control.ai. Please include as much detail as possible, including steps to reproduce the issue, your operating system, and browser version if applicable.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-2">Do you have a community forum?</h3>
            <p className="text-gray-600">
              Yes, we have an active community forum where users can ask questions, share tips, and connect with other Control Desktop users. Visit our <a href="/community" className="text-accent hover:underline">Community page</a> to join the discussion.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Community Support Section */}
      <div className="container mx-auto px-4">
        <motion.div 
          className="bg-gray-50 rounded-2xl p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with other Control Desktop users, share your experiences, and get help from the community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/control-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              <Github className="mr-2" size={20} />
              GitHub
            </a>
            <a
              href="https://discord.gg/control-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-white border border-black text-black font-medium hover:bg-gray-100 transition-colors"
            >
              Discord Community
            </a>
            <a
              href="/community"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-white border border-black text-black font-medium hover:bg-gray-100 transition-colors"
            >
              Community Forum
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}