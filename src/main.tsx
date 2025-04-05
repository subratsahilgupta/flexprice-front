import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as Sentry from '@sentry/react';
import PosthogProvider from './core/services/posthog/PosthogProvider.tsx';
import ReactQueryProvider from './core/tanstack/ReactQueryProvider.tsx';

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

ReactDOM.createRoot(document.getElementById('root')!).render(
	<div>
		{isProd ? (
			<ReactQueryProvider>
				<PosthogProvider>
					<Sentry.ErrorBoundary fallback={<div>Something went wrong</div>}>
						<App />
					</Sentry.ErrorBoundary>
				</PosthogProvider>
			</ReactQueryProvider>
		) : (
			<App />
		)}
	</div>,
);
