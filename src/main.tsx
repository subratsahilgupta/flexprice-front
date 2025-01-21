import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PostHogProvider } from 'posthog-js/react';
import * as Sentry from '@sentry/react';

const isProd = import.meta.env.VITE_APP_ENVIRONMENT === 'prod';

if (isProd) {
	Sentry.init({
		dsn: import.meta.env.VITE_APP_PUBLIC_SENTRY_DSN,
		integrations: [Sentry.browserTracingIntegration()],
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 0,
		replaysOnErrorSampleRate: 0,
	});
}

const options = {
	api_host: import.meta.env.VITE_APP_PUBLIC_POSTHOG_HOST,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<div>
		{isProd ? (
			<PostHogProvider apiKey={import.meta.env.VITE_APP_PUBLIC_POSTHOG_KEY} options={options}>
				<Sentry.ErrorBoundary fallback={<div>Something went wrong</div>}>
					<App />
				</Sentry.ErrorBoundary>
			</PostHogProvider>
		) : (
			<App />
		)}
	</div>,
);
