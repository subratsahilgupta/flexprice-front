import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/UserContext';
import { Button, Input } from '@/components/atoms';
import toast from 'react-hot-toast';
import supabase from '@/core/supbase/config';
import { EyeIcon, EyeOff } from 'lucide-react';
import AuthApi from '@/utils/api_requests/AuthApi';
import { useMutation } from '@tanstack/react-query';

interface SignupFormProps {
	switchTab: (tab: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ switchTab }) => {
	const userContext = useUser();

	// Form fields
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [name, setName] = useState('');
	const [lastName, setLastName] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [supabaseError, setSupabaseError] = useState<string | null>(null);

	// Debug Supabase configuration on component mount
	useEffect(() => {
		// Log Supabase client info (without exposing keys)
		console.log('Supabase client initialized:', !!supabase);
	}, []);

	const signupToSupabase = async (userData: { email: string; password: string; name: string; lastName: string }) => {
		try {
			// Clear any previous errors
			setSupabaseError(null);

			// Log the operation without sensitive data
			console.log('Attempting Supabase signup for:', userData.email);

			const res = await supabase.auth.signUp({
				email: userData.email,
				password: userData.password,
				options: {
					data: {
						full_name: `${userData.name} ${userData.lastName}`,
					},
				},
			});

			console.log('Supabase signup response:', {
				success: !res.error,
				hasUser: !!res.data?.user,
				hasSession: !!res.data?.session,
				errorType: res.error?.name,
			});

			return res;
		} catch (error: any) {
			// Handle network errors or unexpected exceptions
			console.error('Supabase signup critical error:', error.message);
			setSupabaseError(error.message);

			// Return a structured error response similar to what Supabase would return
			return {
				data: { user: null, session: null },
				error: {
					message: `Network error: ${error.message}`,
					name: 'NetworkError',
				},
			};
		}
	};

	// Use React Query for signup mutation
	const signupMutation = useMutation({
		mutationFn: async (userData: { email: string; password: string; name: string; lastName: string }) => {
			// 1. Create account with Supabase
			const { data, error } = await signupToSupabase(userData);
			// emailRedirectTo: `${window.location.origin}/auth/signup/confirmation`,

			console.log('data', data);

			if (error) {
				throw error;
			}

			// Skip backend API call if no user was created
			if (!data.user) {
				throw new Error('Failed to create user account. Please try again.');
			}

			// 2. Register user in your backend API
			try {
				await AuthApi.signup({
					email: userData.email,
					token: data.session?.access_token || '',
				});
			} catch (apiError) {
				console.error('Backend API registration error:', apiError);
				// Continue even if backend login fails temporarily
			}

			return data;
		},
		onSuccess: (data) => {
			// Set user in context
			userContext.setUser(data);

			// Show success message
			toast.success('Account created successfully! Please check your email to confirm your account.');

			// Stay on the same page since email confirmation is required
			// Instead of navigate('/');
		},
		onError: (error: any) => {
			const errorMessage = error.message || 'An unexpected error occurred during signup';

			// Specific error handling based on error type
			if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
				toast.error('Connection error. Please check your internet connection and try again later.');
			} else if (errorMessage.includes('already registered')) {
				toast.error('This email is already registered. Please log in instead.');
				setTimeout(() => switchTab('login'), 2000);
			} else {
				toast.error(errorMessage);
			}

			console.error('Signup error:', error);
		},
	});

	const handleSignup = () => {
		// Clear any previous errors
		setSupabaseError(null);

		// Validate passwords match
		if (password !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		// Validate required fields
		if (!email || !password || !name || !lastName) {
			toast.error('Please fill in all required fields');
			return;
		}

		// Validate password strength
		if (password.length < 6) {
			toast.error('Password must be at least 6 characters long');
			return;
		}

		signupMutation.mutate({
			email,
			password,
			name,
			lastName,
		});
	};

	return (
		<>
			<h2 className='text-3xl font-bold text-center text-gray-800 mb-2'>Create an Account</h2>
			<p className='text-center text-gray-600 mb-8'>Sign up to start using Flexprice.</p>

			{supabaseError && (
				<div className='bg-red-50 text-red-600 p-3 mb-4 rounded-md text-sm'>
					<p className='font-medium'>Connection error:</p>
					<p>{supabaseError}</p>
					<p className='mt-1'>Please check your network connection or try again later.</p>
				</div>
			)}

			<form className='space-y-4'>
				<div className='flex gap-4 w-full'>
					<div className='w-1/2'>
						<label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
							Full Name
						</label>
						<Input
							id='name'
							name='name'
							type='text'
							placeholder='Enter your full name'
							required
							onChange={(s) => setName(s)}
							value={name}
						/>
					</div>
					<div className='w-1/2'>
						<label htmlFor='lastName' className='block text-sm font-medium text-gray-700 mb-1'>
							Last Name
						</label>
						<Input
							id='lastName'
							name='lastName'
							type='text'
							placeholder='Enter your last name'
							required
							onChange={(s) => setLastName(s)}
							value={lastName}
						/>
					</div>
				</div>
				<div>
					<label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
						Email
					</label>
					<Input
						id='email'
						name='email'
						type='email'
						placeholder='Enter your email address'
						required
						onChange={(s) => setEmail(s)}
						value={email}
					/>
				</div>
				<div>
					<label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
						Password
					</label>
					<Input
						suffix={
							<span onClick={() => setShowPassword(!showPassword)} className='cursor-pointer'>
								{showPassword ? <EyeIcon className='w-5 h-5' /> : <EyeOff className='w-5 h-5' />}
							</span>
						}
						id='password'
						name='password'
						type={showPassword ? 'text' : 'password'}
						placeholder='Create a password'
						required
						onChange={(s) => setPassword(s)}
						value={password}
					/>
				</div>
				<div>
					<label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-1'>
						Confirm Password
					</label>
					<Input
						id='confirmPassword'
						suffix={
							<span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='cursor-pointer'>
								{showConfirmPassword ? <EyeIcon className='w-5 h-5' /> : <EyeOff className='w-5 h-5' />}
							</span>
						}
						name='confirmPassword'
						type={showConfirmPassword ? 'text' : 'password'}
						placeholder='Confirm your password'
						required
						onChange={(s) => setConfirmPassword(s)}
						value={confirmPassword}
					/>
				</div>
				<Button onClick={handleSignup} className='w-full !mt-6' isLoading={signupMutation.isPending}>
					Create Account
				</Button>
			</form>

			<p className='mt-6 text-center text-sm text-gray-600'>
				Already have an account?{' '}
				<button onClick={() => switchTab('login')} className='text-grey-600 hover:underline font-medium'>
					Log in
				</button>
			</p>
		</>
	);
};

export default SignupForm;
