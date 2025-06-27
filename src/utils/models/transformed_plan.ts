import { Price } from '@/models/Price';
import { getCurrencySymbol } from '../common/helper_functions';
import { ChargesForBillingPeriodOne } from '@/components/organisms/Subscription/PriceTable';
import { Entitlement } from '@/models/Entitlement';
import { Meter } from '@/models/Meter';
import { formatAmount } from '@/components/atoms/Input/Input';
import { BILLING_PERIOD, PRICE_TYPE, Tier } from '@/models/Price';
import { BILLING_MODEL } from '@/models/Price';
import { INVOICE_CADENCE } from '@/models/Invoice';

export type PriceTier = {
	flat_amount: number;
	unit_amount: number;
	up_to: number;
};

export interface ExpandedPlan {
	readonly id: string;
	readonly name: string;
	readonly lookup_key: string;
	readonly description: string;
	readonly invoice_cadence: string;
	readonly trial_period: number;
	readonly tenant_id: string;
	readonly status: string;
	readonly created_at: Date;
	readonly updated_at: Date;
	readonly created_by: string;
	readonly updated_by: string;
	readonly prices: Price[] | null;
	readonly entitlements: Entitlement[] | null;
	readonly meters: Meter[] | null;
}

export type NormalizedPlan = {
	id: string;
	name: string;
	charges: {
		[billingPeriod: string]: {
			[currency: string]: {
				name: string;
				invoice_cadence: INVOICE_CADENCE;
				price_id: string;
				amount: string;
				display_amount: string;
				currency: string;
				transform_quantity: { divide_by: number } | number;
				type: PRICE_TYPE;
				billing_model: BILLING_MODEL;
				billing_period: BILLING_PERIOD;
				meter_name: string | undefined;
				tiers: PriceTier[];
			}[];
		};
	};
};

const transformTiers = (tiers: Tier[] | null): PriceTier[] => {
	if (!tiers || !Array.isArray(tiers)) {
		return [];
	}

	return tiers.map((tier) => ({
		flat_amount: parseFloat(tier.amount || '0'),
		unit_amount: parseFloat(tier.amount || '0'),
		up_to: tier.quantity || 0,
	}));
};

export const normalizePlan = (originalData: ExpandedPlan): NormalizedPlan => {
	if (!originalData) {
		throw new Error('Plan data is null or undefined');
	}

	const { id, name, prices } = originalData;

	if (!id || !name) {
		throw new Error('Plan is missing required fields: id or name');
	}

	const charges: NormalizedPlan['charges'] = {};

	// Handle case where prices is null or empty array
	if (!prices || !Array.isArray(prices)) {
		return {
			id,
			name,
			charges,
		};
	}

	for (const price of prices) {
		try {
			// Validate required price fields
			if (!price.billing_period || !price.currency) {
				console.warn(`Skipping price ${price.id} - missing billing_period or currency`);
				continue;
			}

			const billingPeriod = price.billing_period.toLowerCase();
			const currency = price.currency.toUpperCase();

			// Ensure the structure exists for the billing period
			if (!charges[billingPeriod]) {
				charges[billingPeriod] = {};
			}

			// Ensure the structure exists for the currency
			if (!charges[billingPeriod][currency]) {
				charges[billingPeriod][currency] = [];
			}

			// Append the charge to the currency-specific array
			charges[billingPeriod][currency].push({
				name,
				price_id: price.id,
				amount: price.amount || '0',
				display_amount: price.display_amount || '0',
				currency: getCurrencySymbol(price.currency),
				transform_quantity: price.transform_quantity || { divide_by: 1 },
				type: price.type,
				billing_period: price.billing_period,
				billing_model: price.billing_model,
				tiers: transformTiers(price.tiers),
				meter_name: price.meter?.name,
				invoice_cadence: price.invoice_cadence,
			});
		} catch (priceError) {
			continue;
		}
	}

	return {
		id,
		name,
		charges,
	};
};

export const getPriceTableCharge = (charge: ChargesForBillingPeriodOne, normalizedPrice: boolean = true) => {
	if (charge.type === PRICE_TYPE.FIXED) {
		// return `${charge.display_amount}`;
		return `${getCurrencySymbol(charge.currency)}${formatAmount(charge.amount.toString())}`;
	} else {
		if (charge.billing_model === BILLING_MODEL.PACKAGE) {
			// return `${charge.display_amount} / ${formatAmount(charge.transform_quantity.divide_by.toString())} units`;
			return `${getCurrencySymbol(charge.currency)}${formatAmount(charge.amount.toString())} / ${formatAmount((charge.transform_quantity as { divide_by: number }).divide_by.toString())} units`;
		} else if (charge.billing_model === BILLING_MODEL.FLAT_FEE) {
			// return `${charge.display_amount } / unit`;
			return `${getCurrencySymbol(charge.currency)}${formatAmount(charge.amount.toString())} / unit`;
		} else if (charge.billing_model === BILLING_MODEL.TIERED) {
			return `Starts at ${normalizedPrice ? charge.currency : getCurrencySymbol(charge.currency)}${formatAmount(charge.tiers[0].unit_amount.toString())} / unit`;
		} else {
			return `${charge.display_amount}`;
		}
	}
};

export const getActualPriceForTotal = (charge: ChargesForBillingPeriodOne) => {
	let result = 0;
	if (charge.billing_model === BILLING_MODEL.PACKAGE) {
		result = parseFloat(charge.amount);
	} else if (charge.billing_model === BILLING_MODEL.TIERED) {
		result = parseFloat(String(charge.tiers[0].flat_amount));
	} else {
		result = parseFloat(charge.amount);
	}

	return result;
};
