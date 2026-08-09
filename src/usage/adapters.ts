//
// Pure DTO → presentational mapping for the usage widgets. No React, no hooks — independently
// unit-testable. Containers call these to turn API responses into the usage widgets' typed
// presentational models. Mirrors `src/pricing/adapters.ts`.
import { FEATURE_TYPE } from '@/models/Feature';
import type { CustomerUsage } from '@/models';
import type { GetDetailedCostAnalyticsResponse } from '@/types/dto/Cost';
import type { CustomAnalyticItem } from '@/types/dto/Events';
import type { MetricCardsConfig } from '@/types/dto/PortalConfig';
import type { UsageQuotaItem, MetricCardItem } from './types';

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

// ── MetricCards ──────────────────────────────────────────────────────────────

export function adaptMetricCards(
	costData: GetDetailedCostAnalyticsResponse | undefined,
	customItems: CustomAnalyticItem[],
	config: MetricCardsConfig,
): MetricCardItem[] {
	const items: MetricCardItem[] = [];
	const currency = costData?.currency ?? 'USD';

	if (config.show_revenue_metric && costData) {
		items.push({ id: 'revenue', titleKey: 'revenue', value: parseFloat(costData.total_revenue), currency });
	}
	if (config.show_cost_metrics && costData) {
		const margin = parseFloat(costData.margin);
		const marginPercent = parseFloat(costData.margin_percent);
		items.push({ id: 'cost', titleKey: 'cost', value: parseFloat(costData.total_cost), currency });
		items.push({ id: 'margin', titleKey: 'margin', value: margin, currency, showChangeIndicator: true, isNegative: margin < 0 });
		items.push({
			id: 'margin-percent',
			titleKey: 'marginPercent',
			value: marginPercent,
			isPercent: true,
			showChangeIndicator: true,
			isNegative: marginPercent < 0,
		});
	}
	if (config.show_custom_metrics) {
		for (const item of customItems ?? []) {
			const value = parseFloat(item.value);
			const isCpm = item.id === 'revenue-per-minute' || item.name === 'revenue-per-minute';
			items.push({
				id: item.id,
				titleKey: isCpm ? 'cpm' : 'custom',
				customLabel: item.name,
				value: isNaN(value) ? 0 : value,
				currency: isCpm ? currency : undefined,
			});
		}
	}
	return items;
}
