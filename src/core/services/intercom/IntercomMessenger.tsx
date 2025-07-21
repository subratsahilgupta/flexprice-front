import { useEffect, useRef } from 'react';
import Intercom from '@intercom/messenger-js-sdk';
import './index.css';
import { BotMessageSquare } from 'lucide-react';
import { Button } from '@/components/atoms';
import useUser from '@/hooks/useUser';

const INACTIVITY_TIMEOUT = 300_000; // 5 minutes

const IntercomMessenger = () => {
	const { user } = useUser();
	const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

	const openIntercom = () => {
		// @ts-expect-error - Intercom types don't include messenger
		window.Intercom('show');
	};

	// Initialize Intercom with user data
	useEffect(() => {
		if (!user) return;

		Intercom({
			app_id: import.meta.env.VITE_INTERCOM_APP_ID,
			user_id: user.id,
			name: user.tenant?.name,
			email: user.email,
			created_at: user.tenant?.created_at ? new Date(user.tenant.created_at).getTime() : undefined,
			hide_default_launcher: true,
		});
	}, [user]);

	// Handle inactivity
	useEffect(() => {
		const resetTimer = () => {
			if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
			inactivityTimer.current = setTimeout(() => {
				openIntercom();
			}, INACTIVITY_TIMEOUT);
		};

		const activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart'];

		activityEvents.forEach((event) => {
			window.addEventListener(event, resetTimer);
		});

		// Start initial timer
		resetTimer();

		return () => {
			if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
			activityEvents.forEach((event) => {
				window.removeEventListener(event, resetTimer);
			});
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
