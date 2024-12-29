import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PostHogProvider } from 'posthog-js/react';

const options = {
	api_host: import.meta.env.VITE_APP_PUBLIC_POSTHOG_HOST,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<div>
		<PostHogProvider apiKey={import.meta.env.VITE_APP_PUBLIC_POSTHOG_KEY} options={options}>
			<App />
		</PostHogProvider>
	</div>,
);
