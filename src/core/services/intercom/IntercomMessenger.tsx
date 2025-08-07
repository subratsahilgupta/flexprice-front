import { useEffect, useRef, useCallback } from 'react';
import Intercom from '@intercom/messenger-js-sdk';
import './index.css';
import { BotMessageSquare } from 'lucide-react';
import { Button } from '@/components/atoms';
import useUser from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import TenantApi from '@/api/TenantApi';
import { TenantMetadataKey } from '@/models/Tenant';

// mseconds * seconds * minutes
const INACTIVITY_TIMEOUT = 1000 * 60 * 15; // 15 minutes

const IntercomMessenger = () => {
	const { user } = useUser();
	const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
	const isInitialized = useRef(false);

	const openIntercom = useCallback(() => {
		// @ts-expect-error - Intercom types don't include messenger
		window.Intercom('show');
	}, []);

	const { data: tenant, isLoading: isTenantLoading } = useQuery({
		queryKey: ['tenant'],
		queryFn: async () => {
			return await TenantApi.getTenantById(user?.tenant?.id ?? '');
		},
		enabled: !!user?.tenant?.id,
	});

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
	}, [user]);

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
