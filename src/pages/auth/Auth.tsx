import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/UserContext';
import { Button, Input, Spacer } from '@/components/atoms';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '@/core/supbase/config';
import { EyeIcon, EyeOff } from 'lucide-react';

type AuthTab = 'login' | 'signup' | 'forgot-password';

const AuthPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const userContext = useUser();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Form fields
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [name, setName] = useState('');
	const [lastName, setLastName] = useState('');

	// Get current tab from URL or default to login
	const [currentTab, setCurrentTab] = useState<AuthTab>('login');

	// Parse query parameters on component mount and tab changes
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const tab = searchParams.get('tab');
		if (tab === 'signup' || tab === 'forgot-password') {
			setCurrentTab(tab);
		} else {
			setCurrentTab('login');
		}
	}, [location]);

	// Change tab and update URL
	const switchTab = (tab: AuthTab) => {
		navigate(`/auth?tab=${tab}`);
	};

	// Handle regular login with email/password
	const handleLogin = async () => {
		setLoading(true);

		try {
			// 1. Authenticate with Supabase
			const { data, error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) {
				toast.error(error.message);
				setLoading(false);
				return;
			}

			// 2. Set user in context
			userContext.setUser(data);

			// 3. Navigate to homepage
			navigate('/');
		} catch (error) {
			toast.error('An unexpected error occurred');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Handle signup with email/password
	const handleSignup = async () => {
		setLoading(true);

		// Validate passwords match
		if (password !== confirmPassword) {
			toast.error('Passwords do not match');
			setLoading(false);
			return;
		}

		try {
			// 1. Create account with Supabase
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/verify-email`,
					data: {
						name: name + ' ' + lastName,
						email: email,
					},
				},
			});

			if (error) {
				toast.error(error.message);
				setLoading(false);
				return;
			}

			// 2. Register user in your backend
			// Add your API call here to your backend signup endpoint
			// const response = await fetch('your-backend/api/signup', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({
			//     email,
			//     name,
			//     supabaseId: data.user.id
			//   })
			// });

			// 3. Set user in context
			userContext.setUser(data);

			// 4. Show success message
			toast.success('Account created successfully');

			// 5. Navigate to homepage
			navigate('/');
		} catch (error) {
			toast.error('An unexpected error occurred during signup');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Handle Google OAuth login/signup
	const handleGoogleAuth = async () => {
		setLoading(true);

		try {
			// Store current tab in sessionStorage for post-redirect validation if needed
			sessionStorage.setItem('authMode', currentTab);
			console.log(`Starting Google authentication in ${currentTab} mode`);

			// Get the current site URL (to handle different environments)
			const siteUrl = window.location.origin;
			console.log('Using site URL for redirect:', siteUrl + '/auth/verify-email');

			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: siteUrl + '/auth/verify-email',
					queryParams: {
						// Add a custom parameter to identify if this is from signup page
						authMode: currentTab,
					},
					// Define the scopes for Google OAuth
					scopes: 'email profile',
				},
			});

			if (data) {
				toast.success(data.url);
			}

			console.log('Google auth initiated successfully:', {
				provider: 'google',
				url: data?.url,
				authMode: currentTab,
				timestamp: new Date().toISOString(),
			});

			if (error) {
				console.error('Google auth error:', error);
				toast.error(error.message);
				setLoading(false);
				return;
			}

			// Important: Need to navigate to the URL provided by Supabase
			if (data?.url) {
				console.log('Redirecting to OAuth URL:', data.url);
				window.location.href = data.url;
			} else {
				console.error('No redirect URL provided by Supabase');
				toast.error('Authentication failed: No redirect URL provided');
				setLoading(false);
			}

			// Note: Redirect will be handled by navigating to the URL
		} catch (error) {
			console.error('Unexpected Google auth error:', error);
			toast.error('An unexpected error occurred');
			setLoading(false);
		}
	};

	// Handle forgot password
	const handleForgotPassword = async () => {
		setLoading(true);

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth?tab=reset-password`,
			});

			if (error) {
				toast.error(error.message);
			} else {
				toast.success('Password reset link sent to your email');
			}
		} catch (error) {
			toast.error('An unexpected error occurred');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Render the appropriate form based on the current tab
	const renderForm = () => {
		switch (currentTab) {
			case 'signup':
				return (
					<>
						<h2 className='text-3xl font-bold text-center text-gray-800 mb-2'>Create an Account</h2>
						<p className='text-center text-gray-600 mb-8'>Sign up to start using Flexprice.</p>

						{/* Google Sign-up Button */}
						<Button
							onClick={handleGoogleAuth}
							variant='outline'
							className='w-full mb-6 flex items-center justify-center gap-2'
							isLoading={loading}>
							<svg className='h-5 w-5' viewBox='0 0 24 24'>
								<path
									d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
									fill='#4285F4'
								/>
								<path
									d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
									fill='#34A853'
								/>
								<path
									d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
									fill='#FBBC05'
								/>
								<path
									d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
									fill='#EA4335'
								/>
							</svg>
							Continue with Google
						</Button>

						<div className='flex items-center justify-center my-6'>
							<div className='flex-1 h-px bg-gray-200'></div>
							<span className='mx-4 text-sm text-gray-500'>or</span>
							<div className='flex-1 h-px bg-gray-200'></div>
						</div>

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
							<Button onClick={() => handleSignup()} className='w-full !mt-6' isLoading={loading}>
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

			case 'forgot-password':
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
							<Button onClick={() => handleForgotPassword()} className='w-full !mt-6' isLoading={loading}>
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

			default: // Login case
				return (
					<>
						<h2 className='text-3xl font-bold text-center text-gray-800 mb-2'>Login to Flexprice</h2>
						<p className='text-center text-gray-600 mb-8'>Enter your email below to login to your account.</p>

						{/* Google Sign-in Button */}
						<Button
							onClick={handleGoogleAuth}
							variant='outline'
							className='w-full mb-6 flex items-center justify-center gap-2'
							isLoading={loading && email === '' && password === ''}>
							<svg className='h-5 w-5' viewBox='0 0 24 24'>
								<path
									d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
									fill='#4285F4'
								/>
								<path
									d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
									fill='#34A853'
								/>
								<path
									d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
									fill='#FBBC05'
								/>
								<path
									d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
									fill='#EA4335'
								/>
							</svg>
							Continue with Google
						</Button>

						<div className='flex items-center justify-center my-6'>
							<div className='flex-1 h-px bg-gray-200'></div>
							<span className='mx-4 text-sm text-gray-500'>or</span>
							<div className='flex-1 h-px bg-gray-200'></div>
						</div>

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
									type='password'
									placeholder='Enter your password'
									required
									onChange={(s) => setPassword(s)}
									value={password}
								/>
							</div>
							<Button onClick={() => handleLogin()} className='w-full !mt-6' isLoading={loading && email !== '' && password !== ''}>
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
		}
	};

	return (
		<div className='flex w-full bg-white page !p-0 !flex-row '>
			{/* Left side - Auth Form */}
			<div className='w-1/2 flex justify-center items-center'>
				<div className='flex flex-col justify-center max-w-xl w-[60%] mx-auto'>
					<div className='flex justify-center mb-4'>
						<img src={'/ic_rounded_flexpirce.svg'} alt='Flexprice Logo' className='h-12' />
					</div>

					{renderForm()}
				</div>
			</div>

			{/* Right side - Marketing Content */}
			<div className='w-1/2 p-4 relative bg-[#D3DAEA] flex flex-col justify-center font-qanelas'>
				{/* bottom pattern - positioned above bg but below content */}
				<img
					src={'/assets/png/login_bg_pattern.svg'}
					alt='Pattern Background'
					className='w-full absolute bottom-0 z-[1] left-0 filter brightness-0 invert'
				/>
				<div className='w-[80%] mx-auto text-center relative z-[2]'>
					<h2 className='text-3xl font-bold text-gray-900'>Developers should focus on building, not billing</h2>
					<Spacer height={10} />
					<p className='text-lg text-gray-700 mb-6'>
						A usage-based billing and metering platform built for developers. Deploy once and stay ahead of all pricing and billing
						changes—forever.
					</p>

					<div className='mt-8 w-[80%] mx-auto'>
						<img src={'/assets/png/ic_login_bg.png'} alt='Pricing Plans' className='w-full' />
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
