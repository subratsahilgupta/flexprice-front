// src/credits/schema.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeCreditBalanceData } from './schema';

describe('normalizeCreditBalanceData', () => {
	it('coerces valid input through unchanged', () => {
		const input = { id: 'w1', name: 'Main', status: 'active' as const, creditBalance: 100, balance: 50, currency: 'USD' };
		expect(normalizeCreditBalanceData(input)).toEqual(input);
	});

	it('falls back an invalid status to active', () => {
		const result = normalizeCreditBalanceData({
			id: 'w1',
			name: 'X',
			status: 'bogus',
			creditBalance: 1,
			balance: 1,
			currency: 'USD',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
		expect(result.status).toBe('active');
	});

	it('coerces malformed numeric fields to 0 instead of throwing', () => {
		const result = normalizeCreditBalanceData({
			id: 'w1',
			name: 'X',
			status: 'active',
			creditBalance: 'oops',
			balance: null,
			currency: 'USD',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
		expect(result.creditBalance).toBe(0);
		expect(result.balance).toBe(0);
	});

	it('repairs a missing id to empty string rather than throwing (single-object path never drops)', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = normalizeCreditBalanceData({ name: 'X', status: 'active', creditBalance: 1, balance: 1, currency: 'USD' } as any);
		expect(result.id).toBe('');
	});
});
