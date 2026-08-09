// src/credits/adapters.test.ts
import { describe, it, expect } from 'vitest';
import { WALLET_STATUS } from '@/models/Wallet';
import { adaptCreditBalance } from './adapters';

const WALLET = {
	id: 'wallet_1',
	customer_id: 'cust_1',
	name: 'Main Wallet',
	currency: 'USD',
	description: '',
	balance: '100.50',
	credit_balance: '200',
	wallet_status: WALLET_STATUS.ACTIVE,
	metadata: {},
	wallet_type: 'PREPAID',
	config: { allowed_price_types: [] },
	conversion_rate: '1',
	created_at: '',
	updated_at: '',
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe('adaptCreditBalance', () => {
	it('prefers realtime balance data over the wallet snapshot', () => {
		const result = adaptCreditBalance(WALLET, {
			currency: 'EUR',
			balance: '150.75',
			credit_balance: '300',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
		expect(result).toEqual({ id: 'wallet_1', name: 'Main Wallet', status: 'active', creditBalance: 300, balance: 150.75, currency: 'EUR' });
	});

	it('falls back to the wallet snapshot when no realtime data is available', () => {
		const result = adaptCreditBalance(WALLET);
		expect(result).toEqual({ id: 'wallet_1', name: 'Main Wallet', status: 'active', creditBalance: 200, balance: 100.5, currency: 'USD' });
	});

	it('maps frozen and closed statuses', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(adaptCreditBalance({ ...WALLET, wallet_status: WALLET_STATUS.FROZEN } as any).status).toBe('frozen');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(adaptCreditBalance({ ...WALLET, wallet_status: WALLET_STATUS.CLOSED } as any).status).toBe('closed');
	});

	it('defaults currency to USD when neither source provides one', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = adaptCreditBalance({ ...WALLET, currency: '' } as any);
		expect(result.currency).toBe('USD');
	});
});
