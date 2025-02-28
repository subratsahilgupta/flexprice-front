import supabase from '@/core/supbase/config';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/UserContext';
import { Button, Input } from '@/components/atoms';
import { EyeIcon, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import AuthApi from '@/utils/api_requests/AuthApi';

interface LoginFormProps {
	switchTab: (tab: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ switchTab }) => {
	const navigate = useNavigate();
	const userContext = useUser();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	// Use React Query for login mutation
	const loginMutation = useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			// 1. Authenticate with Supabase
			const { data, error } = await supabase.auth.signInWithPassword({ email, password });

			if (error) {
				throw error;
			}

			// 2. Optionally call your backend API
			try {
				await AuthApi.login(email, password);
			} catch (apiError) {
				console.error('Backend API login error:', apiError);
				// Continue even if backend login fails temporarily
			}

			return data;
		},
		onSuccess: (data) => {
			// Set user in context
			userContext.setUser(data);

			// Navigate to homepage
			navigate('/');

			toast.success('Login successful');
		},
		onError: (error: any) => {
			toast.error(error.message || 'An unexpected error occurred');
			console.error(error);
		},
	});

	const handleLogin = () => {
		if (!email || !password) {
			toast.error('Please enter both email and password');
			return;
		}

		loginMutation.mutate({ email, password });
	};

	return (
		<>
			<h2 className='text-3xl font-bold text-center text-gray-800 mb-2'>Login to Flexprice</h2>
			<p className='text-center text-gray-600 mb-8'>Enter your email below to login to your account.</p>

			<form className='space-y-5'>
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
					<div className='flex justify-between items-center mb-1'>
						<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
							Password
						</label>
						<button type='button' onClick={() => switchTab('forgot-password')} className='text-sm text-grey-600 hover:underline'>
							Forgot your password?
						</button>
					</div>
					<Input
						id='password'
						name='password'
						type={showPassword ? 'text' : 'password'}
						suffix={
							<span onClick={() => setShowPassword(!showPassword)} className='cursor-pointer'>
								{showPassword ? <EyeIcon className='w-5 h-5' /> : <EyeOff className='w-5 h-5' />}
							</span>
						}
						placeholder='Enter your password'
						required
						onChange={(s) => setPassword(s)}
						value={password}
					/>
				</div>
				<Button onClick={handleLogin} className='w-full !mt-6' isLoading={loginMutation.isPending}>
					Login
				</Button>
			</form>

			<p className='mt-6 text-center text-sm text-gray-600'>
				Don't have an account?{' '}
				<button onClick={() => switchTab('signup')} className='text-grey-600 hover:underline font-medium'>
					Sign up
				</button>
			</p>
		</>
	);
};

export default LoginForm;
