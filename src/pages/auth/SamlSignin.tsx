import { useTranslation } from 'react-i18next';
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

	const handleSamlLogin = () => {
		const base = config.api.baseUrl.replace(/\/$/, '');
		window.location.href = `${base}/auth/saml/${encodeURIComponent(tenantId)}/login`;
	};

	return (
		<div>
			<Button onClick={handleSamlLogin} variant='outline' className='w-full mb-6 flex items-center justify-center gap-2 h-11'>
				{t('buttons.continueWithSso')}
			</Button>
		</div>
	);
};

export default SamlSignin;
