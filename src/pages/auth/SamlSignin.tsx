import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Button } from '@/components/atoms';
import { config } from '@/config/config';

/**
 * Query parameter naming the tenant whose identity provider should handle the
 * login, e.g. /login?sso=tenant_abc123.
 *
 * SSO is configured per tenant, so the browser has to say which tenant it means
 * before anyone has authenticated. Until email-domain discovery exists, that
 * comes from the link a tenant's administrator hands to its users rather than
 * from anything typed at the login page — an end user has no reason to know a
 * tenant ID, and asking them to paste one would be worse than a bookmark.
 */
export const SSO_TENANT_PARAM = 'sso';

/**
 * sessionStorage key marking that this browser tab started an SSO login.
 *
 * The callback stores whatever token it is handed, and it is a public route: without this, anyone
 * could send a victim `/auth/callback#token=<attacker's token>` and have the victim's dashboard
 * adopt the attacker's session, so everything the victim then did would happen in the attacker's
 * account. Requiring a marker this tab set itself means a fragment arriving unprompted is refused.
 *
 * sessionStorage rather than localStorage: it is per tab and cleared when the tab closes, so an
 * abandoned login does not leave the callback armed indefinitely.
 */
export const SSO_PENDING_KEY = 'saml_login_pending';

interface SamlSigninProps {
	tenantId: string;
}

/**
 * Entry point for SAML single sign-on.
 *
 * A full page navigation, not a fetch: the browser must follow the redirect to
 * the identity provider and carry its session cookies there, and it is the
 * browser the identity provider posts the assertion back through. An XHR would
 * break both halves of that.
 */
const SamlSignin = ({ tenantId }: SamlSigninProps) => {
	const { t } = useTranslation('auth');
	const [isStarting, setIsStarting] = useState(false);

	const handleSamlLogin = async () => {
		const base = config.api.baseUrl.replace(/\/$/, '');
		const loginUrl = `${base}/auth/saml/${encodeURIComponent(tenantId)}/login`;

		// Ask before navigating. The endpoint answers 404 when SSO is not live for
		// this tenant — not configured, not enabled, or not yet approved — and a
		// bare navigation would land the browser on the API's JSON error body with
		// no way back. `manual` keeps the browser from following the redirect on
		// this request, so a live endpoint is reported as an opaque response
		// rather than being consumed here.
		setIsStarting(true);
		try {
			const probe = await fetch(loginUrl, { method: 'GET', redirect: 'manual' });
			if (probe.status === 404) {
				toast.error(t('sso.notAvailable'));
				return;
			}
		} catch {
			// A network or CORS failure says nothing about whether SSO works, so
			// fall through to the navigation rather than refusing a login that
			// might well succeed.
		} finally {
			setIsStarting(false);
		}

		// Mark that this tab started the flow, so the callback can tell a token it
		// asked for from one someone sent it.
		sessionStorage.setItem(SSO_PENDING_KEY, tenantId);

		// Deliberately a full page navigation: the browser must carry its own
		// session to the identity provider, and it is the browser the assertion is
		// posted back through.
		window.location.href = loginUrl;
	};

	return (
		<div>
			<Button
				onClick={handleSamlLogin}
				variant='outline'
				isLoading={isStarting}
				className='w-full mb-6 flex items-center justify-center gap-2 h-11'>
				{t('buttons.continueWithSso')}
			</Button>
		</div>
	);
};

export default SamlSignin;
