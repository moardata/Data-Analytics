/**
 * Supabase Client Configuration
 * Handles database connections for the Creator Analytics app
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('DEBUG - Supabase URL:', supabaseUrl ? 'Found' : 'MISSING');
console.log('DEBUG - Supabase Key:', supabaseKey ? 'Found' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Database features will be disabled.');
  console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  throw new Error('Supabase credentials are required. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Database Schema Types
 * These match the tables defined in schema.sql
 */

export interface Client {
  id: string;
  whop_user_id: string;
  company_id: string;
  email: string;
  name: string | null;
  subscription_tier: 'free' | 'pro' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  client_id: string;
  whop_user_id: string;
  email: string | null;
  name: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  client_id: string;
  entity_id: string | null;
  event_type: 'order' | 'subscription' | 'activity' | 'form_submission' | 'custom';
  event_data: Record<string, any>;
  whop_event_id: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  entity_id: string;
  whop_subscription_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  amount: number;
  currency: string;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: string;
  client_id: string;
  insight_type: 'weekly_summary' | 'recommendation' | 'alert' | 'trend';
  title: string;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface FormTemplate {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  fields: FormField[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'rating' | 'multiple_choice' | 'number' | 'email';
  required: boolean;
  options?: string[]; // For multiple choice
  placeholder?: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  entity_id: string;
  client_id: string;
  responses: Record<string, any>;
  submitted_at: string;
}

