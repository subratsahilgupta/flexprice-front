import type { TFunction } from 'i18next';

/** Logo asset per sync provider key, reusing the same assets as the Integrations page. */
export const MARKETPLACE_LOGO: Record<string, string> = {
	aws_marketplace: '/assets/logo/Marketplace-AWS.png',
	gcp_marketplace: '/assets/logo/google-cloud.png',
	azure_marketplace: '/assets/logo/Azure.png',
};

const MARKETPLACE_LABEL_KEY: Record<string, string> = {
	aws_marketplace: 'insightsTools.usageSyncs.providers.awsMarketplace',
	gcp_marketplace: 'insightsTools.usageSyncs.providers.gcpMarketplace',
	azure_marketplace: 'insightsTools.usageSyncs.providers.azureMarketplace',
};

/** Localized display name for a sync provider key; falls back to the raw key for one this app doesn't recognize yet. */
export function getProviderLabel(t: TFunction<'settings'>, provider: string): string {
	const key = MARKETPLACE_LABEL_KEY[provider];
	return key ? t(key) : provider;
}
