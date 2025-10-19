/**
 * Supabase Client Configuration
 * Handles database connections for the Creator Analytics app
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rdllbtepprsfkbewqcwj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbGxidGVwcHJzZmtiZXdxY3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjY0OTYsImV4cCI6MjA3NTc0MjQ5Nn0.tMaiAycTIUZ0BX1Es0FjWl96Mh3VPwbAi8Lvk35kr00';

// Check if credentials are valid (not placeholders)
const hasValidCredentials = 
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('your_supabase_url_here');

console.log('DEBUG - Supabase URL:', supabaseUrl ? 'Found' : 'MISSING');
console.log('DEBUG - Supabase Key:', supabaseKey ? 'Found' : 'MISSING');
console.log('DEBUG - Valid Credentials:', hasValidCredentials ? 'YES' : 'NO');

// Create client only if credentials are valid, otherwise create a mock
export const supabase = hasValidCredentials && supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Export a flag so other code can check if Supabase is available
export const supabaseAvailable = !!supabase;

if (!supabase) {
  console.warn('⚠️ Supabase not configured. Database features disabled. App will work in test mode.');
}

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

