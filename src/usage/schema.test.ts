import { describe, it, expect } from 'vitest';
import { normalizeUsageQuotaItems, normalizeMetricCardItems, normalizeUsageTrendSeries, normalizeUsageBreakdownRows } from './schema';

describe('normalizeUsageQuotaItems', () => {
	it('coerces valid input through unchanged', () => {
		const input = [{ id: 'f1', name: 'API Calls', currentUsage: 10, limit: 100, isUnlimited: false }];
		expect(normalizeUsageQuotaItems(input)).toEqual(input);
	});

	it('drops non-array input and reports via onValidationError', () => {
		const issues: unknown[] = [];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeUsageQuotaItems('not-an-array' as any, (issue) => issues.push(issue));
		expect(result).toEqual([]);
		expect(issues.length).toBe(1);
	});

	it('coerces malformed numeric fields instead of throwing', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeUsageQuotaItems([{ id: 'f1', name: 'X', currentUsage: 'oops', limit: null, isUnlimited: 'yes' }] as any);
		expect(result).toEqual([{ id: 'f1', name: 'X', currentUsage: 0, limit: null, isUnlimited: true }]);
	});
});

describe('normalizeMetricCardItems', () => {
	it('coerces valid input through unchanged', () => {
		const input = [{ id: 'revenue', titleKey: 'revenue' as const, value: 100, currency: 'USD' }];
		expect(normalizeMetricCardItems(input)).toEqual(input);
	});

	it('falls back an unknown titleKey to custom', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeMetricCardItems([{ id: 'x', titleKey: 'not-a-real-key', value: 5 }] as any);
		expect(result[0].titleKey).toBe('custom');
	});

	it('normalizes a null optional string field (currency) to undefined instead of the literal string "null"', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeMetricCardItems([{ id: 'x', titleKey: 'revenue', value: 5, currency: null }] as any);
		expect(result[0].currency).toBeUndefined();
		expect(result[0].currency).not.toBe('null');
	});
});

describe('normalizeUsageTrendSeries', () => {
	it('coerces valid input through unchanged', () => {
		const input = [{ id: 'feat_1', name: 'API Calls', points: [{ timestamp: '2026-01-01T00:00:00Z', usage: 10 }] }];
		expect(normalizeUsageTrendSeries(input)).toEqual(input);
	});

	it('defaults a missing points array to []', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeUsageTrendSeries([{ id: 'feat_1', name: 'X' }] as any);
		expect(result[0].points).toEqual([]);
	});
});

describe('normalizeUsageBreakdownRows', () => {
	it('coerces valid input through unchanged', () => {
		const input = [{ id: 'feat_1', name: 'API Calls', totalUsage: 10, totalCost: 5 }];
		expect(normalizeUsageBreakdownRows(input)).toEqual(input);
	});

	it('coerces non-numeric usage/cost to 0 instead of throwing', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeUsageBreakdownRows([{ id: 'feat_1', name: 'X', totalUsage: 'oops', totalCost: null }] as any);
		expect(result[0].totalUsage).toBe(0);
		expect(result[0].totalCost).toBe(0);
	});

	it('normalizes null optional string fields (groupName, groupId, unit, currency, totalUsageDisplay) to undefined instead of the literal string "null"', () => {
		const result = normalizeUsageBreakdownRows([
			{
				id: 'feat_1',
				name: 'X',
				totalUsage: 10,
				totalCost: 5,
				groupId: null,
				groupName: null,
				unit: null,
				currency: null,
				totalUsageDisplay: null,
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		] as any);
		expect(result[0].groupId).toBeUndefined();
		expect(result[0].groupName).toBeUndefined();
		expect(result[0].unit).toBeUndefined();
		expect(result[0].currency).toBeUndefined();
		expect(result[0].totalUsageDisplay).toBeUndefined();
	});
});
