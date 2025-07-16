import { BaseModel } from './base';
import { BILLING_CADENCE, INVOICE_CADENCE } from './Invoice';
import { Meter } from './Meter';

export interface Price extends BaseModel {
	readonly amount: string;
	readonly display_amount: string;
	readonly currency: string;
	readonly plan_id: string;
	readonly type: PRICE_TYPE;
	readonly billing_period: BILLING_PERIOD;
	readonly billing_period_count: number;
	readonly billing_model: BILLING_MODEL;
	readonly billing_cadence: BILLING_CADENCE;
	readonly tier_mode: TIER_MODE;
	readonly tiers: Tier[] | null;
	readonly meter_id: string;
	readonly lookup_key: string;
	readonly description: string;
	readonly transform_quantity: {
		divide_by: number;
	};
	readonly meter: Meter;
	readonly invoice_cadence: INVOICE_CADENCE;
	readonly trial_period: number;
}

export interface Tier {
	readonly flat_amount: string;
	readonly unit_amount: string;
	readonly up_to: number;
}

export enum BILLING_MODEL {
	FLAT_FEE = 'FLAT_FEE',
	PACKAGE = 'PACKAGE',
	TIERED = 'TIERED',
}

export enum PRICE_TYPE {
	USAGE = 'USAGE',
	FIXED = 'FIXED',
}

export enum TIER_MODE {
	VOLUME = 'VOLUME',
	SLAB = 'SLAB',
}

export enum BILLING_PERIOD {
	MONTHLY = 'MONTHLY',
	ANNUAL = 'ANNUAL',
	WEEKLY = 'WEEKLY',
	DAILY = 'DAILY',
	QUARTERLY = 'QUARTERLY',
	HALF_YEARLY = 'HALF_YEARLY',
}
