import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageLoader } from '@/components/atoms';
import { RouteNames } from '@/core/routes/Routes';

/**
 * Landing page for a completed SAML login.
 *
 * The backend validates the assertion and redirects the browser here with the
 * token it minted, so this page only has to store it in the shape the rest of
 * the app already reads and get the token out of the URL.
 */
const SamlCallback = () => {
	const { t } = useTranslation('auth');
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	// Runs once: React 18 mounts effects twice in development, and the second
	// pass would find the token already stripped from the URL and report a
	// failure over a login that actually succeeded.
	const hasProcessed = useRef(false);

	useEffect(() => {
		if (hasProcessed.current) return;
		hasProcessed.current = true;

		const token = searchParams.get('token');
		if (!token) {
			setError(t('sso.missingToken'));
			return;
		}

		// Same shape the password login writes, so everything downstream — the
		// axios client, useUser, logout — treats an SSO session identically. Only
		// `token` is read for authentication; the user is loaded from /users/me.
		localStorage.setItem(
			'token',
			JSON.stringify({
				token,
				user_id: searchParams.get('user_id') ?? undefined,
				tenant_id: searchParams.get('tenant_id') ?? undefined,
			}),
		);

		// replace: true so the token is not left in history, where it would be
		// recoverable with the back button after a logout.
		navigate(RouteNames.home, { replace: true });
	}, [searchParams, navigate, t]);

	if (error) {
		return (
			<div className='flex min-h-screen items-center justify-center p-6'>
				<div className='max-w-md text-center'>
					<p className='mb-4 text-sm text-red-600'>{error}</p>
					<button className='text-sm underline' onClick={() => navigate(RouteNames.login, { replace: true })}>
						{t('buttons.backToLogin')}
					</button>
				</div>
			</div>
		);
	}

	return <PageLoader />;
};

export default SamlCallback;
