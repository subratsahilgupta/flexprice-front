import { PostHogProvider } from 'posthog-js/react';
import React, { ReactNode, useEffect } from 'react';
import useUser from '@/hooks/useUser';
import posthog from 'posthog-js';

interface Props {
	children: ReactNode;
}

const options = {
	api_host: import.meta.env.VITE_APP_PUBLIC_POSTHOG_HOST,
};

const isProd = import.meta.env.VITE_APP_ENVIRONMENT === 'prod';

const PosthogProvider: React.FC<Props> = ({ children }) => {
	const { user } = useUser();

	useEffect(() => {
		if (user) {
			posthog.identify(user.email, {
				email: user.email,
				name: user.tenant?.name,
				created_at: user.tenant?.created_at ? new Date(user.tenant.created_at).getTime() : undefined,
			});
		} else {
			posthog.reset();
		}
	}, [user]);

	if (isProd) {
		return (
			<PostHogProvider apiKey={import.meta.env.VITE_APP_PUBLIC_POSTHOG_KEY} options={options}>
				{children}
			</PostHogProvider>
		);
	}
	return children;
};

export default PosthogProvider;
