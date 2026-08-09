import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import enBilling from '@/i18n/locales/en/billing.json';
import { WALLET_TRANSACTION_REASON } from '@/models/Wallet';
import WalletTransactionsTable from './WalletTransactionsTable';

describe('WalletTransactionsTable', () => {
	it('renders a real translated transaction-reason label through a host i18next instance', () => {
		const instance = createInstance();
		instance.init({ lng: 'en', fallbackLng: 'en', ns: ['billing'], defaultNS: 'billing', resources: { en: { billing: enBilling } } });
		render(
			<I18nextProvider i18n={instance}>
				<WalletTransactionsTable
					data={[
						{
							amount: 100,
							balance_after: 200,
							balance_before: 100,
							created_at: '2026-01-01T00:00:00Z',
							description: '',
							id: 'tx_1',
							metadata: {},
							reference_id: '',
							reference_type: '',
							transaction_status: 'completed',
							type: 'credit',
							wallet_id: 'w1',
							credit_amount: 100,
							transaction_reason: WALLET_TRANSACTION_REASON.FREE_CREDIT_GRANT,
							expiry_date: '',
						},
					]}
				/>
			</I18nextProvider>,
		);
		expect(screen.getByText('Free Credits Added')).toBeInTheDocument();
	});
});
