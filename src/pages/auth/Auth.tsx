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
		<div className='flex min-h-screen bg-white'>
			{/* Left blank section */}
			<div className='flex-1 bg-gray-800'></div>

			{/* Right login form section */}
			<div className='flex flex-col justify-center w-2/5 bg-white p-8'>
				<Toaster />
				<div>
					<h2 className='text-2xl font-semibold text-center text-gray-800'>Login to Your Account</h2>
					<form onSubmit={handleLogin} className='mt-8 space-y-6'>
						<div className='space-y-4'>
							<Input id='email' name='email' type='email' placeholder='Enter your email' required onChange={(s) => setemail(s)} />
							<Input
								id='password'
								name='password'
								type='password'
								placeholder='Enter your password'
								required
								onChange={(s) => setpassword(s)}
							/>
						</div>
						<div className='mt-4'>
							<Button className='w-full' onClick={() => handleLogin()} loading={loading}>
								Login with email
							</Button>
						</div>
						<p className='mt-4 text-center text-sm text-gray-600'>
							Don't have an account?{' '}
							<a href='/signup' className='text-blue-500 hover:underline'>
								Sign up here
							</a>
						</p>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
