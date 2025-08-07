import { useEffect, useRef, useCallback } from 'react';
import Intercom from '@intercom/messenger-js-sdk';
import './index.css';
import { BotMessageSquare } from 'lucide-react';
import { Button } from '@/components/atoms';
import useUser from '@/hooks/useUser';
import { useQuery, useMutation } from '@tanstack/react-query';
import TenantApi from '@/api/TenantApi';
import { TenantMetadataKey } from '@/models/Tenant';
import { toast } from 'react-hot-toast';
import OnboardingApi from '@/api/OnboardingApi';
import { refetchQueries } from '../tanstack/ReactQueryProvider';

// mseconds * seconds * minutes
const INACTIVITY_TIMEOUT = 1000 * 60 * 15; // 15 minutes

const IntercomMessenger = () => {
	const { user } = useUser();
	const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
	const isInitialized = useRef(false);
	const isIntercomOpen = useRef(false);
	const hideEventTriggered = useRef(false);

	const openIntercom = useCallback(() => {
		// @ts-expect-error - Intercom types don't include messenger
		window.Intercom('show');
		isIntercomOpen.current = true;
		hideEventTriggered.current = false;
		console.log('Intercom opened manually');
	}, []);

	const { data: tenant, isLoading: isTenantLoading } = useQuery({
		queryKey: ['tenant'],
		queryFn: async () => {
			return await TenantApi.getTenantById(user?.tenant?.id ?? '');
		},
		enabled: !!user?.tenant?.id,
	});

	// Mutation to update tenant when user closes Intercom
	const { mutate: updateTenantOnIntercomClose } = useMutation({
		mutationFn: () =>
			TenantApi.updateTenant({
				name: tenant?.name || '',
				metadata: {
					...tenant?.metadata,
					[TenantMetadataKey.ONBOARDING_COMPLETED]: 'true',
				},
			}),
		onSuccess: async () => {
			// Refetch user data to update the UI
			await refetchQueries(['user', 'tenant']);

			// Mark user as onboarded
			OnboardingApi.MarkUserAsOnboarded();

			console.log('User marked as onboarded after closing Intercom');
			toast.success("Welcome! You've been marked as onboarded.");
		},
		onError: (error: any) => {
			console.error('Failed to mark user as onboarded:', error);
			toast.error('Failed to update onboarding status. Please try again.');
		},
	});

	// Handle Intercom events
	const handleIntercomHide = useCallback(() => {
		if (hideEventTriggered.current) return; // Prevent multiple calls

		console.log('Intercom messenger was hidden/closed by user');
		hideEventTriggered.current = true;
		isIntercomOpen.current = false;

		// Check if user hasn't completed onboarding
		const onboardingMetadata = tenant?.metadata?.[TenantMetadataKey.ONBOARDING_COMPLETED];
		const onboardingCompleted = onboardingMetadata === 'true';

		if (!onboardingCompleted && user && tenant) {
			console.log('User has not completed onboarding, marking as onboarded...');

			// Mark user as onboarded when they close Intercom
			updateTenantOnIntercomClose();
		}

		// Add your custom actions here
		// For example:
		// - Track analytics event
		// - Update user preferences
		// - Show a follow-up message
		// - Reset inactivity timer
		// - etc.

		// Example: Track that user closed the messenger
		if (typeof window !== 'undefined' && (window as any).gtag) {
			(window as any).gtag('event', 'intercom_messenger_closed', {
				user_id: user?.id,
				tenant_id: user?.tenant?.id,
				onboarding_completed: onboardingCompleted,
			});
		}

		// Example: Store in localStorage that user has seen the messenger
		if (typeof window !== 'undefined') {
			localStorage.setItem('intercom_messenger_seen', 'true');
		}

		// Example: You could also trigger other actions
		// like showing a different UI element or updating state
	}, [user, tenant, updateTenantOnIntercomClose]);

	const handleIntercomShow = useCallback(() => {
		console.log('Intercom messenger was shown by user');
		isIntercomOpen.current = true;
		hideEventTriggered.current = false;

		// Add your custom actions here when messenger is shown
		// For example:
		// - Track that user opened messenger
		// - Update analytics
		// - etc.

		if (typeof window !== 'undefined' && (window as any).gtag) {
			(window as any).gtag('event', 'intercom_messenger_opened', {
				user_id: user?.id,
				tenant_id: user?.tenant?.id,
			});
		}
	}, [user]);

	// Poll for Intercom state changes
	useEffect(() => {
		if (!isInitialized.current) return;

		const checkIntercomState = () => {
			try {
				// @ts-expect-error - Intercom types don't include messenger
				const isVisible = window.Intercom('isVisible');

				if (isVisible && !isIntercomOpen.current) {
					// Intercom was opened
					handleIntercomShow();
				} else if (!isVisible && isIntercomOpen.current && !hideEventTriggered.current) {
					// Intercom was closed
					handleIntercomHide();
				}
			} catch (error) {
				// Intercom might not be ready yet
				console.log('Intercom not ready for state check');
			}
		};

		const interval = setInterval(checkIntercomState, 1000); // Check every second

		return () => {
			clearInterval(interval);
		};
	}, [handleIntercomShow, handleIntercomHide]);

	// Initialize Intercom with user data
	useEffect(() => {
		if (!user || isInitialized.current) return;

		Intercom({
			app_id: 'yprjoygg',
			user_id: user.id,
			name: user.tenant?.name,
			email: user.email,
			created_at: user.tenant?.created_at ? new Date(user.tenant.created_at).getTime() : undefined,
			hide_default_launcher: true,
		});

		isInitialized.current = true;

		// Add event listeners for Intercom events
		const handleMessage = (event: MessageEvent) => {
			if (event.data && typeof event.data === 'object') {
				console.log('Intercom message event:', event.data);
				// Handle Intercom events
				if (event.data.type === 'intercom:hide' || event.data.type === 'hide') {
					handleIntercomHide();
				} else if (event.data.type === 'intercom:show' || event.data.type === 'show') {
					handleIntercomShow();
				}
			}
		};

		window.addEventListener('message', handleMessage);

		// Cleanup
		return () => {
			window.removeEventListener('message', handleMessage);
		};
	}, [user, handleIntercomHide, handleIntercomShow]);

	// Create resetTimer callback outside useEffect
	const resetTimer = useCallback(() => {
		// Clear existing timer
		if (inactivityTimer.current) {
			clearTimeout(inactivityTimer.current);
			console.log('Intercom auto-popup: Timer reset due to user activity');
		}

		// Set new timer if onboarding is not completed (metadata is null, field doesn't exist, or isn't 'true')
		const onboardingMetadata = tenant?.metadata?.[TenantMetadataKey.ONBOARDING_COMPLETED];
		const onboardingCompleted = onboardingMetadata === 'true';

		if (!onboardingCompleted) {
			inactivityTimer.current = setTimeout(() => {
				console.log('Intercom auto-popup: Timer expired - opening Intercom messenger');
				openIntercom();
			}, INACTIVITY_TIMEOUT);
			console.log('Intercom auto-popup: New timer set for', INACTIVITY_TIMEOUT / 1000, 'seconds');
		} else {
			console.log('Intercom auto-popup: Timer NOT set - onboarding completed during activity (metadata = "true")');
		}
	}, [tenant?.metadata, openIntercom]);

	// Handle inactivity timer for onboarding users
	useEffect(() => {
		// Clear any existing timer first
		if (inactivityTimer.current) {
			clearTimeout(inactivityTimer.current);
			inactivityTimer.current = null;
		}

		// Don't set up timer if:
		// 1. User is not loaded
		// 2. Tenant is still loading
		if (!user || isTenantLoading) {
			console.log('Intercom auto-popup: Timer NOT set up because:', {
				userLoaded: !!user,
				isTenantLoading,
				reason: !user ? 'User not loaded' : 'Tenant still loading',
			});
			return;
		}

		// Check onboarding status - show timer if metadata is null, field doesn't exist, or isn't 'true'
		const onboardingMetadata = tenant?.metadata?.[TenantMetadataKey.ONBOARDING_COMPLETED];
		const onboardingCompleted = onboardingMetadata === 'true';

		console.log('Intercom auto-popup: Decision factors:', {
			userLoaded: !!user,
			isTenantLoading,
			hasTenantMetadata: !!tenant?.metadata,
			onboardingMetadataValue: onboardingMetadata,
			onboardingCompleted,
			tenantId: user?.tenant?.id,
			metadataExists: !!tenant?.metadata,
			onboardingFieldExists: TenantMetadataKey.ONBOARDING_COMPLETED in (tenant?.metadata || {}),
		});

		// Show timer if:
		// 1. Metadata is null/undefined
		// 2. Onboarding field doesn't exist in metadata
		// 3. Onboarding field exists but isn't set to 'true'
		if (onboardingCompleted) {
			console.log('Intercom auto-popup: Timer NOT set up - onboarding already completed (metadata = "true")');
			return;
		}

		console.log('Intercom auto-popup: Timer WILL be set up because:', {
			metadataIsNull: !tenant?.metadata,
			onboardingFieldMissing: !(TenantMetadataKey.ONBOARDING_COMPLETED in (tenant?.metadata || {})),
			onboardingNotTrue: onboardingMetadata !== 'true',
			reason: !tenant?.metadata
				? 'Metadata is null/undefined'
				: !(TenantMetadataKey.ONBOARDING_COMPLETED in tenant.metadata)
					? 'Onboarding field does not exist in metadata'
					: 'Onboarding field exists but is not set to "true"',
		});

		const activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart'];

		// Add event listeners
		activityEvents.forEach((event) => {
			window.addEventListener(event, resetTimer, { passive: true });
		});

		// Start initial timer
		resetTimer();

		// Cleanup function
		return () => {
			// Clear timer
			if (inactivityTimer.current) {
				clearTimeout(inactivityTimer.current);
				inactivityTimer.current = null;
			}

			// Remove event listeners
			activityEvents.forEach((event) => {
				window.removeEventListener(event, resetTimer);
			});
		};
	}, [user, tenant?.metadata, isTenantLoading, resetTimer]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (inactivityTimer.current) {
				clearTimeout(inactivityTimer.current);
				inactivityTimer.current = null;
			}
		};
	}, []);

	return (
		<Button size='sm' variant='outline' onClick={openIntercom}>
			<BotMessageSquare absoluteStrokeWidth />
			Help
		</Button>
	);
};

export default IntercomMessenger;
