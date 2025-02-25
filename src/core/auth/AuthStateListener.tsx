import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '@/core/supbase/config';
import { useUser } from '@/hooks/UserContext';
import toast from 'react-hot-toast';

/**
 * Component to handle authentication state changes and OAuth callbacks.
 * This must be used inside a Router context.
 */
const AuthStateListener: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, setUser } = useUser();

	useEffect(() => {
		// Function to handle auth state changes
		const handleAuthStateChange = async () => {
			try {
				// Check for auth session
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error('Error getting auth session:', error);
					return;
				}

				// If no session, don't proceed with checking for OAuth callback
				if (!session) {
					return;
				}

				// Skip if we already have a user and this isn't a potential OAuth redirect
				if (user && !location.hash.includes('access_token')) {
					return;
				}

				// Extract custom params - first try URL, then sessionStorage
				const searchParams = new URLSearchParams(location.search);
				let authMode = searchParams.get('authMode');

				// If not in URL params, check sessionStorage (set during Google auth initiation)
				if (!authMode) {
					authMode = sessionStorage.getItem('authMode') || 'login';
					// Clear it after using it
					sessionStorage.removeItem('authMode');
				}

				// Set user in context if we don't already have it
				if (!user) {
					setUser({ session, user: session.user });
					console.log('User set in context:', {
						id: session.user.id,
						email: session.user.email,
						authMode: authMode,
					});
				}

				// Check if this is an OAuth redirect based on URL hash
				if (location.hash.includes('access_token')) {
					console.log('Processing OAuth callback with hash:', location.hash.substring(0, 20) + '...');

					// Check if this is a new user (created now) or existing user
					const {
						data: { user: authUser },
						error: userError,
					} = await supabase.auth.getUser();

					if (userError) {
						console.error('Error getting user details:', userError);
						toast.error('Authentication successful, but there was an error loading your profile');
						return;
					}

					console.log('User details from OAuth:', {
						id: authUser?.id,
						email: authUser?.email,
						authProvider: authUser?.app_metadata?.provider,
						isVerified: authUser?.email_confirmed_at ? true : false,
					});

					const isNewUser = authUser?.created_at
						? new Date().getTime() - new Date(authUser.created_at).getTime() < 60000 // Within last minute
						: false;

					console.log('User status:', {
						isNewUser: isNewUser,
						authMode: authMode,
						createdAt: authUser?.created_at,
					});

					// If this was a signup or it's a brand new user, call your backend to create the user profile
					if (authMode === 'signup' || isNewUser) {
						try {
							console.log('Creating user profile for new user:', {
								userId: authUser?.id || 'unknown',
								authMode: authMode,
							});

							// Call your backend signup API
							// Example:
							// const response = await fetch('your-api/users', {
							//   method: 'POST',
							//   headers: {
							//     'Content-Type': 'application/json',
							//     'Authorization': `Bearer ${session.access_token}`
							//   },
							//   body: JSON.stringify({
							//     id: authUser?.id,
							//     email: authUser?.email,
							//     name: authUser?.user_metadata?.full_name || authUser?.email
							//   })
							// });
							//
							// // Log the API response
							// console.log('User profile creation response:', await response.json());

							toast.success('Account created successfully!');
						} catch (error) {
							console.error('Error registering user with backend:', error);
							toast.error('Account created, but there was an issue setting up your profile');
						}
					} else {
						console.log('User logged in successfully:', {
							userId: authUser?.id || 'unknown',
							email: authUser?.email || 'unknown',
							provider: authUser?.app_metadata?.provider || 'unknown',
						});
						toast.success('Successfully logged in!');
					}

					// After handling the callback, redirect to home (with replace to avoid back button issues)
					console.log('Redirecting to home page after successful authentication');
					navigate('/', { replace: true });
				}
			} catch (err) {
				console.error('Auth callback error:', err);
			}
		};

		// Check for auth state changes when location changes
		handleAuthStateChange();
	}, [location, navigate, setUser, user]);

	// Set up auth state change listener for general auth events
	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_IN' && session) {
				setUser({ session, user: session.user });
				// Note: We don't navigate here as the handleAuthStateChange function handles that for OAuth flows
			} else if (event === 'SIGNED_OUT') {
				setUser(null);
				navigate('/auth');
			}
		});

		return () => {
			// Clean up the listener
			if (authListener && authListener.subscription) {
				authListener.subscription.unsubscribe();
			}
		};
	}, [navigate, setUser]);

	return <>{children}</>;
};

export default AuthStateListener;
