import useUser from '@/hooks/useUser';
import Intercom from '@intercom/messenger-js-sdk';
import './index.css';

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
		<button onClick={openIntercom} className='text-sm text-gray-500 hover:text-gray-800'>
			Help
		</button>
	);
};

export default IntercomMessenger;
