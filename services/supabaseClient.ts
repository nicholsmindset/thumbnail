/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Auth features will be disabled.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Type definitions for database tables
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  credits: number;
  plan: 'free' | 'creator' | 'agency';
  total_generations: number;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string | null;
  plan: 'creator' | 'agency';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  type: 'subscription' | 'generation' | 'refund' | 'adjustment' | 'bonus';
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  prompt: string | null;
  quality: 'standard' | 'high' | 'ultra';
  aspect_ratio: string;
  credits_used: number;
  image_url: string | null;
  analysis_score: number | null;
  created_at: string;
}

export default supabase;
