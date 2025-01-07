import { Price } from '@/models/Price';
import { getCurrencySymbol, mapBillingPeriod } from '../common/helper_functions';
import { ChargesForBillingPeriodOne } from '@/components/organisms/Subscription/PriceTable';

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
}

export type NormalizedPlan = {
	id: string;
	name: string;
	charges: {
		[billingPeriod: string]: {
			name: string;
			price_id: string;
			amount: string;
			display_amount: string;
			currency: string;
			transform_quantity: number;
			type: string;
			billing_model: string;
			billing_period: string;
			meter_name: string | undefined;
			tiers: PriceTier[];
		}[];
	};
};

export const normalizePlan = (originalData: ExpandedPlan): NormalizedPlan => {
	const { id, name, prices } = originalData;

	const charges: NormalizedPlan['charges'] = {};

	for (const price of prices ?? []) {
		const billingPeriod = price.billing_period.toLowerCase();

		if (!charges[billingPeriod]) {
			charges[billingPeriod] = [];
		}

		const currentCharge = {
			name: name,
			price_id: price.id,
			amount: price.amount,
			display_amount: price.display_amount,
			currency: getCurrencySymbol(price.currency),
			transform_quantity: price.transform_quantity['divide_by'] || 0,
			type: price.type,
			billing_period: price.billing_period.toLocaleLowerCase(),
			billing_model: price.billing_model,
			tiers: price.tiers ?? [],
			meter_name: price.meter?.name,
		};

		charges[billingPeriod].push(currentCharge);
	}
	return {
		id,
		name,
		charges,
	};
};

export const getPriceTableCharge = (charge: ChargesForBillingPeriodOne) => {
	if (charge.billing_model === 'PACKAGE') {
		return `${charge.display_amount} /unit/${mapBillingPeriod(charge.billing_period)}`;
	} else if (charge.billing_model === 'TIERED') {
		return `Starts at ${charge.currency}${charge.tiers[0].flat_amount}/unit/${charge.billing_period}`;
	} else {
		return `${charge.display_amount} /${mapBillingPeriod(charge.billing_period)}`;
	}
};

export const getActualPriceForTotal = (charge: ChargesForBillingPeriodOne) => {
	let result = 0;
	if (charge.billing_model === 'PACKAGE') {
		result = parseFloat(charge.amount);
	} else if (charge.billing_model === 'TIERED') {
		result = parseFloat(String(charge.tiers[0].flat_amount));
	} else {
		result = parseFloat(charge.amount);
	}

	return result;
};
