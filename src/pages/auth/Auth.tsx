import React, { useState } from 'react';
import { useUser } from '@/hooks/UserContext';
import { Button, Input } from '@/components/atoms';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import supabase from '@/core/supbase/config';

const AuthPage: React.FC = () => {
	const navigate = useNavigate();
	const userContext = useUser();
	const [loading, setLoading] = useState(false);
	const [email, setemail] = useState('');
	const [password, setpassword] = useState('');

	const handleLogin = async () => {
		setLoading(true);

		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			toast.error(error.message);
		} else {
			userContext.setUser(data);
			navigate('/');
		}
		setLoading(false);
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-50'>
			<div className='w-full max-w-md p-8 bg-white rounded-lg shadow-md'>
				<Toaster />
				<h2 className='text-2xl font-semibold text-center text-gray-800 mb-6'>Login</h2>
				<form onSubmit={handleLogin} className='space-y-5'>
					<div>
						<Input
							label='Email'
							id='email'
							name='email'
							type='email'
							placeholder='Enter your email'
							required
							onChange={(s) => setemail(s)}
						/>
					</div>
					<div>
						<Input
							label='Password'
							id='password'
							name='password'
							type='password'
							placeholder='Enter your password'
							required
							onChange={(s) => setpassword(s)}
						/>
					</div>
					<Button onClick={() => handleLogin()} className='w-full !mt-4' isLoading={loading}>
						Login with email
					</Button>
				</form>
				{/* <p className='mt-4 text-center text-sm text-gray-600'>
					Don't have an account?{' '}
					<a href='/signup' className='text-blue-500 hover:underline'>
						Sign up here
					</a>
				</p> */}
			</div>
		</div>
	);
};

export default AuthPage;
