import { BILLING_CADENCE, INVOICE_CADENCE } from '@/constants';
import { Price } from '@/models/Price';
import { BILLING_MODEL, BILLING_PERIOD, PRICE_TYPE, PRICE_UNIT_TYPE, TIER_MODE } from '@/models/Price';

export interface GetAllPricesResponse {
	prices: Price[];
	total: number;
	offset: number;
	limit: number;
}

export interface CreatePriceRequest {
	amount?: string;
	currency: string;
	plan_id?: string;
	type: PRICE_TYPE;
	price_unit_type: PRICE_UNIT_TYPE;
	billing_period: BILLING_PERIOD;
	billing_period_count: number;
	billing_model: BILLING_MODEL;
	billing_cadence: BILLING_CADENCE;
	meter_id?: string;
	filter_values?: Record<string, string[]>;
	lookup_key?: string;
	invoice_cadence: INVOICE_CADENCE;
	trial_period?: number;
	description?: string;
	metadata?: Record<string, string>;
	tier_mode?: TIER_MODE;
	tiers?: CreatePriceTier[];
	transform_quantity?: TransformQuantity;
}

export interface CreatePriceTier {
	flat_amount?: string;
	unit_amount?: string;
	up_to: number;
}

export interface TransformQuantity {
	divide_by?: number;
	round?: 'up' | 'down';
}

export interface UpdatePriceRequest {
	lookup_key?: string;
	description?: string;
	metadata?: Record<string, string>;
}
