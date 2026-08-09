//
// Pure DTO → presentational mapping for the usage widgets. No React, no hooks — independently
// unit-testable. Containers call these to turn API responses into the usage widgets' typed
// presentational models. Mirrors `src/pricing/adapters.ts`.
import { FEATURE_TYPE } from '@/models/Feature';
import type { CustomerUsage } from '@/models';
import type { UsageQuotaItem } from './types';

/** Metered-usage entitlements only — static/boolean entitlements have no quota to show. */
export function adaptUsageQuotaItems(usageData: CustomerUsage[]): UsageQuotaItem[] {
	return (usageData ?? [])
		.filter((item) => item.feature?.type === FEATURE_TYPE.METERED)
		.map((item, index) => ({
			id: item.feature?.id || String(index),
			name: item.feature?.name || '',
			currentUsage: Number(item.current_usage || 0),
			limit: item.is_unlimited ? null : item.total_limit != null ? Number(item.total_limit) : null,
			isUnlimited: item.is_unlimited,
		}));
}
