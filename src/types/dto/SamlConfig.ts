/**
 * SAML SSO Configuration Types
 *
 * Stored in the settings API under key: saml_config
 * PUT /settings/saml_config replaces exactly the fields below the tenant is allowed to
 * edit. `active` is intentionally excluded from this type's editable fields — it is
 * Flexprice's own approval flag, flipped directly in the database, and the API silently
 * ignores it if sent in the PUT body.
 */

/** Roles the SAML JIT provisioner is allowed to grant. `super_admin` is deliberately absent —
 * the backend rejects it outright, since a SAML assertion must never be able to mint an admin. */
export const SAML_DEFAULT_ROLES = ['all_reader', 'all_writer'] as const;
export type SamlDefaultRole = (typeof SAML_DEFAULT_ROLES)[number];

export interface SamlConfig {
	enabled: boolean;
	idp_entity_id: string;
	idp_sso_url: string;
	idp_certificate: string;
	email_attribute: string;
	default_role: SamlDefaultRole | '';
	/** Read-only: Flexprice's approval that this tenant may serve SSO. Ignored by the API if sent. */
	active: boolean;
	/** When true, the backend refuses password login for this tenant's non-super_admin users. */
	enforce_sso: boolean;
}

export const DEFAULT_SAML_CONFIG: SamlConfig = {
	enabled: false,
	idp_entity_id: '',
	idp_sso_url: '',
	idp_certificate: '',
	email_attribute: '',
	default_role: '',
	active: false,
	enforce_sso: false,
};

/** Merges a tenant's saved config on top of defaults; any field absent from the saved value falls back. */
export function mergeSamlConfig(defaults: SamlConfig, saved: Partial<SamlConfig> | null | undefined): SamlConfig {
	if (!saved) return defaults;
	return {
		enabled: saved.enabled ?? defaults.enabled,
		idp_entity_id: saved.idp_entity_id ?? defaults.idp_entity_id,
		idp_sso_url: saved.idp_sso_url ?? defaults.idp_sso_url,
		idp_certificate: saved.idp_certificate ?? defaults.idp_certificate,
		email_attribute: saved.email_attribute ?? defaults.email_attribute,
		default_role: (saved.default_role as SamlDefaultRole | undefined) ?? defaults.default_role,
		active: saved.active ?? defaults.active,
		enforce_sso: saved.enforce_sso ?? defaults.enforce_sso,
	};
}

/** Strips `active` before sending to the API — the field is read-only and the backend ignores it,
 * but omitting it makes that contract explicit at the call site instead of relying on server behavior. */
export function toSamlConfigUpdatePayload(config: SamlConfig): Omit<SamlConfig, 'active'> {
	const { active: _active, ...payload } = config;
	return payload;
}

/**
 * `idp_sso_url` must be `https://`. Plain `http://` is rejected by the backend except for
 * localhost / 127.0.0.1 / ::1, which exist purely to let a local IdP (e.g. simplesamlphp on
 * docker compose) be tested without TLS.
 */
export function isValidIdpSsoUrl(value: string): boolean {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return false;
	}

	if (url.protocol === 'https:') return true;
	if (url.protocol !== 'http:') return false;

	const loopbackHosts = ['localhost', '127.0.0.1', '::1', '[::1]'];
	return loopbackHosts.includes(url.hostname);
}
