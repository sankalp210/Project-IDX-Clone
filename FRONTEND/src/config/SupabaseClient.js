// Import the createClient function from the Supabase JS library
import { createClient } from '@supabase/supabase-js';

// Retrieve the Supabase URL and public key from environment variables.
// It's important to keep these keys out of your source code and
// manage them securely, especially the service_role key if you were using it.
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are commonly used prefixes
// for environment variables in Vite projects. Adjust if using a different build tool.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a new Supabase client instance.
// The createClient function takes the Supabase URL and the public (anon) key.
// The anon key is safe to use in your frontend application as it only
// allows access to data with RLS (Row Level Security) enabled, which you
// should configure in your Supabase project.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This file now exports a pre-configured Supabase client instance
// that can be imported and used throughout your React application
// for interacting with your Supabase backend services like authentication,
// database, storage, etc.