import { describe, it, expect } from 'vitest';
import { normalizeUsageQuotaItems } from './schema';

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
