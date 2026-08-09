import { describe, it, expect } from 'vitest';
import { FEATURE_TYPE } from '@/models/Feature';
import { adaptUsageQuotaItems, adaptMetricCards, adaptUsageTrendSeries, adaptUsageBreakdownRows } from './adapters';

describe('adaptUsageQuotaItems', () => {
	it('keeps only metered entitlements and maps limit/unlimited', () => {
		const result = adaptUsageQuotaItems([
			{
				id: 'ent_1',
				feature: { id: 'feat_1', name: 'API Calls', type: FEATURE_TYPE.METERED },
				total_limit: 1000,
				is_unlimited: false,
				current_usage: 250,
				usage_percent: 25,
				is_enabled: true,
				is_soft_limit: false,
				next_usage_reset_at: null,
				sources: [],
			},
			{
				id: 'ent_2',
				feature: { id: 'feat_2', name: 'Seats', type: FEATURE_TYPE.STATIC },
				total_limit: null,
				is_unlimited: false,
				current_usage: 0,
				usage_percent: 0,
				is_enabled: true,
				is_soft_limit: false,
				next_usage_reset_at: null,
				sources: [],
			},
			{
				id: 'ent_3',
				feature: { id: 'feat_3', name: 'Storage', type: FEATURE_TYPE.METERED },
				total_limit: null,
				is_unlimited: true,
				current_usage: 42,
				usage_percent: 0,
				is_enabled: true,
				is_soft_limit: false,
				next_usage_reset_at: null,
				sources: [],
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		] as any);

		expect(result).toEqual([
			{ id: 'feat_1', name: 'API Calls', currentUsage: 250, limit: 1000, isUnlimited: false },
			{ id: 'feat_3', name: 'Storage', currentUsage: 42, limit: null, isUnlimited: true },
		]);
	});

	it('returns [] for empty/undefined input', () => {
		expect(adaptUsageQuotaItems([])).toEqual([]);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(adaptUsageQuotaItems(undefined as any)).toEqual([]);
	});
});

describe('adaptMetricCards', () => {
	const costData = {
		cost_analytics: [],
		total_revenue: '1000',
		total_cost: '400',
		margin: '600',
		margin_percent: '60',
		roi: '1.5',
		roi_percent: '150',
		currency: 'USD',
		start_time: '2026-01-01',
		end_time: '2026-01-31',
	};

	it('includes revenue + cost + margin cards when enabled', () => {
		const result = adaptMetricCards(costData, [], { show_custom_metrics: false, show_revenue_metric: true, show_cost_metrics: true });
		expect(result).toEqual([
			{ id: 'revenue', titleKey: 'revenue', value: 1000, currency: 'USD' },
			{ id: 'cost', titleKey: 'cost', value: 400, currency: 'USD' },
			{ id: 'margin', titleKey: 'margin', value: 600, currency: 'USD', showChangeIndicator: true, isNegative: false },
			{ id: 'margin-percent', titleKey: 'marginPercent', value: 60, isPercent: true, showChangeIndicator: true, isNegative: false },
		]);
	});

	it('maps the revenue-per-minute custom metric to the cpm title key with currency', () => {
		const result = adaptMetricCards(
			costData,
			[{ id: 'revenue-per-minute', name: 'revenue-per-minute', feature_name: 'Revenue per minute', value: '0.12', type: 'currency' }],
			{ show_custom_metrics: true, show_revenue_metric: false, show_cost_metrics: false },
		);
		expect(result).toEqual([
			{ id: 'revenue-per-minute', titleKey: 'cpm', customLabel: 'revenue-per-minute', value: 0.12, currency: 'USD' },
		]);
	});

	it('maps a plain custom metric to the custom title key with no currency', () => {
		const result = adaptMetricCards(
			costData,
			[{ id: 'active-calls', name: 'Active Calls', feature_name: 'Active Calls', value: '42', type: 'count' }],
			{
				show_custom_metrics: true,
				show_revenue_metric: false,
				show_cost_metrics: false,
			},
		);
		expect(result).toEqual([{ id: 'active-calls', titleKey: 'custom', customLabel: 'Active Calls', value: 42, currency: undefined }]);
	});

	it('returns [] when nothing is enabled or costData is missing', () => {
		expect(adaptMetricCards(undefined, [], { show_custom_metrics: false, show_revenue_metric: true, show_cost_metrics: true })).toEqual([]);
	});
});

describe('adaptUsageTrendSeries', () => {
	const items = [
		{
			feature_id: 'feat_1',
			source: 'feat_1',
			name: 'API Calls',
			points: [{ timestamp: '2026-01-01T00:00:00Z', usage: 10, cost: 1, event_count: 5 }],
		},
		{ feature_id: 'feat_2', source: 'feat_2', name: 'Storage', points: [] },
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	] as any;

	it('maps items to series with no filtering when mode is all', () => {
		const result = adaptUsageTrendSeries(items, { feature_filter_mode: 'all' });
		expect(result).toEqual([
			{ id: 'feat_1', name: 'API Calls', points: [{ timestamp: '2026-01-01T00:00:00Z', usage: 10 }] },
			{ id: 'feat_2', name: 'Storage', points: [] },
		]);
	});

	it('applies an include_list filter', () => {
		const result = adaptUsageTrendSeries(items, { feature_filter_mode: 'include_list', feature_ids: ['feat_1'] });
		expect(result.map((s) => s.id)).toEqual(['feat_1']);
	});

	it('applies an exclude_list filter', () => {
		const result = adaptUsageTrendSeries(items, { feature_filter_mode: 'exclude_list', feature_ids: ['feat_1'] });
		expect(result.map((s) => s.id)).toEqual(['feat_2']);
	});
});

describe('adaptUsageBreakdownRows', () => {
	it('maps group, usage display, and cost fields', () => {
		const result = adaptUsageBreakdownRows([
			{
				feature_id: 'feat_1',
				name: 'API Calls',
				group: { id: 'grp_1', name: 'Core' },
				total_usage: 1234,
				total_usage_display: '1,234',
				unit: 'call',
				unit_plural: 'calls',
				total_cost: 12.5,
				currency: 'USD',
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		] as any);
		expect(result).toEqual([
			{
				id: 'feat_1',
				name: 'API Calls',
				groupId: 'grp_1',
				groupName: 'Core',
				totalUsage: 1234,
				totalUsageDisplay: '1,234',
				unit: 'calls',
				totalCost: 12.5,
				currency: 'USD',
			},
		]);
	});

	it('leaves group fields undefined when the row has no group', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = adaptUsageBreakdownRows([{ feature_id: 'feat_2', name: 'Storage', total_usage: 0, total_cost: 0 }] as any);
		expect(result[0].groupId).toBeUndefined();
		expect(result[0].groupName).toBeUndefined();
	});
});
