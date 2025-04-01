import { createClient } from '@supabase/supabase-js';

const isSelfHosted = import.meta.env.VITE_ENVIRONMENT === 'self-hosted';

// Create Supabase client
const supabase = isSelfHosted
	? ({
			auth: {
				getSession: () => Promise.resolve({ data: { session: null }, error: null }),
				getUser: () => Promise.resolve({ data: { user: null }, error: null }),
				signIn: () => Promise.resolve({ data: { user: null }, error: null }),
				signOut: () => Promise.resolve({ error: null }),
				onAuthStateChange: () => ({ data: { subscription: null }, error: null }),
				resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
				signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
				signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
				resend: () => Promise.resolve({ data: {}, error: null }),
				refreshSession: () => Promise.resolve({ data: { session: null }, error: null }),
				signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
			},
		} as any)
	: createClient(import.meta.env.VITE_SUPABASE_URL || '', import.meta.env.VITE_SUPABASE_ANON_KEY || '');

export default supabase;
