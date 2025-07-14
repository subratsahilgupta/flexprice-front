import React, { useState, useEffect } from 'react';
import { Spacer } from '@/components/atoms';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import AuthService from '@/core/auth/AuthService';

enum AuthTab {
	LOGIN = 'login',
	SIGNUP = 'signup',
	FORGOT_PASSWORD = 'forgot-password',
}

const AuthPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// Get current tab from URL or default to login
	const [currentTab, setCurrentTab] = useState<AuthTab>(AuthTab.LOGIN);

	useEffect(() => {
		const fetchUser = async () => {
			const tokenStr = await AuthService.getAcessToken();
			if (tokenStr) {
				navigate('/');
			}
		};
		fetchUser();
	}, []);

	// Parse query parameters on component mount and tab changes
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const tab = searchParams.get('tab');
		if (tab === AuthTab.SIGNUP || tab === AuthTab.FORGOT_PASSWORD) {
			setCurrentTab(tab as AuthTab);
		} else {
			setCurrentTab(AuthTab.LOGIN);
		}
	}, [location]);

	// Change tab and update URL
	const switchTab = (tab: AuthTab) => {
		navigate(`/auth?tab=${tab}`);
	};

	// Render the appropriate form based on the current tab
	const renderForm = () => {
		switch (currentTab) {
			case AuthTab.SIGNUP:
				return (
					<>
						<SignupForm switchTab={(tab: string) => switchTab(tab as AuthTab)} />
					</>
				);

			case AuthTab.FORGOT_PASSWORD:
				return (
					<>
						<ForgotPasswordForm switchTab={(tab: string) => switchTab(tab as AuthTab)} />
					</>
				);

			default: // Login case
				return (
					<>
						<LoginForm switchTab={(tab: string) => switchTab(tab as AuthTab)} />
					</>
				);
		}
	};

	return (
		<div className='flex w-full bg-white page !p-0 !flex-row '>
			{/* Left side - Auth Form */}
			<div className='w-[50%] flex justify-center items-center'>
				<div className='flex flex-col justify-center max-w-xl w-[55%] mx-auto'>
					<div className='flex justify-center mb-4'>
						<img src={'/ic_rounded_flexprice.svg'} alt='Flexprice Logo' className='h-12' />
					</div>

					{currentTab === AuthTab.SIGNUP && (
						<>
							<h2 className='text-3xl font-medium text-center text-gray-800 mb-2'>Create an account</h2>
							<p className='text-center text-gray-600 mb-8'>Sign up to start using Flexprice.</p>
						</>
					)}
					{currentTab === AuthTab.LOGIN && (
						<>
							<h2 className='text-3xl font-medium text-center text-gray-800 mb-2'>Login to your account</h2>
							<p className='text-center text-gray-600 mb-8'>Login to start using Flexprice.</p>
						</>
					)}
					{currentTab === AuthTab.FORGOT_PASSWORD && (
						<>
							<h2 className='text-3xl font-medium text-center text-gray-800 mb-2'>Forgot your password?</h2>
							<p className='text-center text-gray-600 mb-8'>Enter your email to reset your password.</p>
						</>
					)}

					{renderForm()}
				</div>
			</div>

			{/* Right side - Marketing Content */}
			<div className='w-[60%] p-4 relative bg-[#D3DAEA] flex flex-col justify-center font-qanelas overflow-hidden'>
				{/* Background pattern wrapper */}
				<div className='absolute inset-0 overflow-hidden'>
					<img
						loading='lazy'
						src={'/assets/png/login_bg_pattern.svg'}
						alt='Pattern Background'
						className='absolute bottom-0 w-full h-auto max-h-[60%] object-cover opacity-10'
					/>
				</div>

				{/* Content container */}
				<div className='w-[80%] mx-auto text-center relative z-10'>
					<h2 className='text-3xl font-medium text-gray-900'>Developers should focus on building, not billing</h2>
					<Spacer height={10} />
					<p className='text-lg text-gray-700 mb-6'>
						A usage-based billing and metering platform built for developers. Deploy once and stay ahead of all pricing and billing
						changes—forever.
					</p>

					<div className='mt-8 w-[80%] mx-auto'>
						<img loading='lazy' className='w-full' alt='Pricing Plans' src={'/assets/png/ic_login_bg.png'} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
