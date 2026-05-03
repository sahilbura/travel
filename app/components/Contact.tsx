// filepath: app/components/ContactSection.tsx
'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setResponseMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setResponseMessage(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setResponseMessage(data.message || 'An unexpected error occurred.');
      }
    } catch (error) {
      console.error("Message send failed:", error);
      setStatus('error');
      setResponseMessage('Failed to send message. Please try again later.');
    }
  };

  const contactInfoItems = [
    {
      icon: FiMapPin,
      title: 'Our Office',
      value: '123 Adventure Lane, Wanderlust City, 98765'
    },
    {
      icon: FiPhone,
      title: 'Phone',
      value: '+1 (555) 123-4567'
    },
    {
      icon: FiMail,
      title: 'Email',
      value: 'hello@tripnext.com'
    }
  ];

  return (
    <div className="relative top-[600px] geist-sans text-[var(--color-primary)] py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-[var(--color-primary)] mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Get In Touch
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Have a question or a project in mind? We&apos;d love to hear from you. Drop us a message and we&apos;ll respond within 24 hours.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Contact Information */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {contactInfoItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={index}
                  className="flex items-start gap-4 group cursor-pointer"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Icon className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-primary)]">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{item.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Contact Form */}
          <motion.form 
            onSubmit={handleSubmit}
            className="space-y-6 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="space-y-2"
              whileFocus={{ scale: 1.02 }}
            >
              <label className="block text-sm font-semibold text-[var(--color-primary)]">Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all duration-300 bg-white dark:bg-slate-700 text-[var(--color-primary)]"
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              whileFocus={{ scale: 1.02 }}
            >
              <label className="block text-sm font-semibold text-[var(--color-primary)]">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all duration-300 bg-white dark:bg-slate-700 text-[var(--color-primary)]"
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              whileFocus={{ scale: 1.02 }}
            >
              <label className="block text-sm font-semibold text-[var(--color-primary)]">Subject</label>
              <Input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What's this about?"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all duration-300 bg-white dark:bg-slate-700 text-[var(--color-primary)]"
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              whileFocus={{ scale: 1.02 }}
            >
              <label className="block text-sm font-semibold text-[var(--color-primary)]">Message</label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us your thoughts..."
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition-all duration-300 bg-white dark:bg-slate-700 text-[var(--color-primary)] resize-none"
              />
            </motion.div>

            {/* Status Messages */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: status !== 'idle' ? 1 : 0, y: status !== 'idle' ? 0 : -10 }}
              transition={{ duration: 0.3 }}
            >
              {status === 'success' && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-lg" />
                  <p className="text-green-800 dark:text-green-300 font-medium">{responseMessage}</p>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <FiAlertCircle className="text-red-600 dark:text-red-400 text-lg" />
                  <p className="text-red-800 dark:text-red-300 font-medium">{responseMessage}</p>
                </div>
              )}
            </motion.div>

            <motion.button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              whileHover={{ scale: status === 'loading' ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status === 'loading' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <motion.svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ x: 3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}