import { describe, it, expect } from 'vitest';
import { FEATURE_TYPE } from '@/models/Feature';
import { adaptUsageQuotaItems } from './adapters';

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
