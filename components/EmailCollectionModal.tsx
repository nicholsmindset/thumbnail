/**
 * Email Collection Modal Component
 * Collects user email before allowing access to the free trial
 */

import React, { useState } from 'react';
import { Mail, Loader2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface EmailCollectionModalProps {
  isOpen: boolean;
  onSubmit: (email: string) => void;
  onClose: () => void;
}

const EmailCollectionModal: React.FC<EmailCollectionModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Store the email in Supabase leads table (optional - will create if table exists)
      try {
        await supabase.from('leads').insert({
          email: email.toLowerCase().trim(),
          source: 'free_trial',
          created_at: new Date().toISOString(),
        });
      } catch {
        // Table might not exist, continue anyway - email stored locally as fallback
      }

      // Store in localStorage as backup
      localStorage.setItem('trial_email', email.toLowerCase().trim());
      localStorage.setItem('trial_started_at', new Date().toISOString());

      // Call the onSubmit callback to proceed
      onSubmit(email);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
      aria-describedby="email-modal-description"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-slate-800 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 rounded-full mb-4" aria-hidden="true">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 id="email-modal-title" className="text-2xl font-bold text-white">Start Your Free Trial</h2>
          <p id="email-modal-description" className="text-slate-400 text-sm mt-2">
            Enter your email to get instant access to our AI thumbnail generator
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              10 free credits to start
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              No credit card required
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              AI-powered thumbnail generation
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Getting things ready...
                </>
              ) : (
                <>
                  Get Started Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <p className="text-center text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            <br />
            We'll never spam you or share your email.
          </p>

          {/* Back Button */}
          <button
            onClick={onClose}
            className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            Go back to homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailCollectionModal;
