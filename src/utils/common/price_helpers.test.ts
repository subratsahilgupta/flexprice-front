import { describe, it, expect } from 'vitest';
import { formatPriceDisplay, NormalizedPriceDisplay } from './price_helpers';
import { BILLING_MODEL, TIER_MODE, PRICE_UNIT_TYPE } from '@/models/Price';

const base: NormalizedPriceDisplay = {
	amount: '0',
	symbol: '$',
	tiers: null,
	billingModel: BILLING_MODEL.FLAT_FEE,
	tierMode: TIER_MODE.VOLUME,
	transformQuantity: null,
	priceUnitType: PRICE_UNIT_TYPE.FIAT,
};

describe('formatPriceDisplay', () => {
	it('caps a long floating-point decimal tail to 6 places instead of rendering it in full', () => {
		expect(formatPriceDisplay({ ...base, amount: '0.066666666666667' })).toBe('$0.066667');
	});

	it('leaves short, common decimal amounts unchanged', () => {
		expect(formatPriceDisplay({ ...base, amount: '5.00' })).toBe('$5.00');
		expect(formatPriceDisplay({ ...base, amount: '19.99' })).toBe('$19.99');
	});

	it('leaves whole-number amounts unchanged', () => {
		expect(formatPriceDisplay({ ...base, amount: '100' })).toBe('$100');
	});

	it('caps the divideBy-derived unit amount for PACKAGE billing', () => {
		expect(
			formatPriceDisplay({
				...base,
				billingModel: BILLING_MODEL.PACKAGE,
				amount: '0.066666666666667',
				transformQuantity: { divide_by: 15 },
			}),
		).toBe('$0.066667 / 15 units');
	});

	it('caps the first tier unit amount for TIERED billing', () => {
		expect(
			formatPriceDisplay({
				...base,
				billingModel: BILLING_MODEL.TIERED,
				tiers: [{ up_to: 100, unit_amount: '0.066666666666667', flat_amount: '0' }],
			}),
		).toBe('starts at $0.066667 per unit');
	});
});
