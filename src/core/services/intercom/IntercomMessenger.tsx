import useUser from '@/hooks/useUser';
import Intercom from '@intercom/messenger-js-sdk';
import './index.css';
import { BotMessageSquare } from 'lucide-react';
import { Button } from '@/components/atoms';
const IntercomMessenger = () => {
	const { user } = useUser();

	const openIntercom = () => {
		// @ts-expect-error - Intercom types don't include messenger
		window.Intercom('show');
	};
	Intercom({
		app_id: 'yprjoygg',
		user_id: user?.id,
		name: user?.tenant?.name,
		email: user?.email,
		created_at: user?.tenant?.created_at ? new Date(user?.tenant?.created_at).getTime() : undefined,
		hide_default_launcher: true,
	});

	return (
		<Button size='sm' variant='outline' onClick={openIntercom}>
			<BotMessageSquare absoluteStrokeWidth />
			Help
		</Button>
	);
};

export default IntercomMessenger;
