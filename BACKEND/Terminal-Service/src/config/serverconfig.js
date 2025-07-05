import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT;

export const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

export const SUPABASE_URL = process.env.SUPABASE_URL;