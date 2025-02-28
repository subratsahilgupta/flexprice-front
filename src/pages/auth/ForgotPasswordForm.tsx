import React, { useState } from 'react';
import { Button, Input } from '@/components/atoms';
import toast from 'react-hot-toast';
import supabase from '@/core/supbase/config';
import { useMutation } from '@tanstack/react-query';

interface ForgotPasswordFormProps {
	switchTab: (tab: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ switchTab }) => {
	const [email, setEmail] = useState('');

	// Use React Query for forgot password mutation
	const forgotPasswordMutation = useMutation({
		mutationFn: async (email: string) => {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth?tab=reset-password`,
			});

			if (error) {
				throw error;
			}

			return true;
		},
		onSuccess: () => {
			toast.success('Password reset link sent to your email');
		},
		onError: (error: any) => {
			toast.error(error.message || 'An unexpected error occurred');
			console.error(error);
		},
	});

	const handleForgotPassword = () => {
		if (!email) {
			toast.error('Please enter your email address');
			return;
		}

		forgotPasswordMutation.mutate(email);
	};

	return (
		<>
			<h2 className='text-3xl font-bold text-center text-gray-800 mb-2'>Reset Password</h2>
			<p className='text-center text-gray-600 mb-8'>Enter your email to receive a password reset link.</p>

			<form className='space-y-4'>
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
				<Button onClick={handleForgotPassword} className='w-full !mt-6' isLoading={forgotPasswordMutation.isPending}>
					Send Reset Link
				</Button>
			</form>

			<p className='mt-6 text-center text-sm text-gray-600'>
				Remember your password?{' '}
				<button onClick={() => switchTab('login')} className='text-grey-600 hover:underline font-medium'>
					Back to login
				</button>
			</p>
		</>
	);
};

export default ForgotPasswordForm;
