import { PostHogProvider } from 'posthog-js/react';
import React, { ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

const options = {
	api_host: import.meta.env.VITE_APP_PUBLIC_POSTHOG_HOST,
};

const isProd = import.meta.env.VITE_APP_ENVIRONMENT === 'prod';
const PosthogProvider: React.FC<Props> = ({ children }) => {
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
