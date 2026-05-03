'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';

export default function ContactPage() {
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

  return (
    <div className="geist-sans min-h-screen bg-[var(--color-bg)] text-[var(--color-primary)] pt-40 pb-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[var(--color-primary)]">
            Get In Touch
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Have a question or a project in mind? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <FiMapPin className="text-[var(--color-accent1)] text-2xl mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-primary)]">Our Office</h3>
                <p className="text-zinc-400">123 Adventure Lane, Wanderlust City, 98765</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <FiMail className="text-[var(--color-accent1)] text-2xl mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-primary)]">Email Us</h3>
                <p className="text-zinc-400">hello@tripnext.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <FiPhone className="text-[var(--color-accent1)] text-2xl mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-primary)]">Call Us</h3>
                <p className="text-zinc-400">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="bg-transparent border border-[var(--color-accent1)] focus-visible:ring-[var(--color-accent2)] text-[var(--color-primary)]"
              />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                className="bg-transparent border border-[var(--color-accent1)] focus-visible:ring-[var(--color-accent2)] text-[var(--color-primary)]"
              />
            </div>
            <Input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              required
              className="bg-transparent border border-[var(--color-accent1)] focus-visible:ring-[var(--color-accent2)] text-[var(--color-primary)]"
            />
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows={5}
              required
              className="bg-transparent border border-[var(--color-accent1)] focus-visible:ring-[var(--color-accent2)] text-[var(--color-primary)]"
            />

            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-full bg-[var(--color-btn)] text-[var(--color-primary)] hover:bg-[var(--color-accent2)] transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </Button>

            {responseMessage && (
              <p className={`mt-4 text-center text-sm ${
                status === 'success'
                  ? 'text-[var(--color-accent1)]'
                  : 'text-[var(--color-accent2)]'
              }`}>
                {responseMessage}
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}