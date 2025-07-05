// src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE } from './serverconfig.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

