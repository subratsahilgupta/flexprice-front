import { BILLING_CADENCE, INVOICE_CADENCE } from '@/constants';
import { Price } from '@/models/Price';
import { BILLING_MODEL, BILLING_PERIOD, PRICE_TYPE, PRICE_UNIT_TYPE, TIER_MODE, PRICE_ENTITY_TYPE } from '@/models/Price';
import { Plan } from '@/models/Plan';
import Addon from '@/models/Addon';
import Feature from '@/models/Feature';
import { Meter } from '@/models/Meter';
import { QueryFilter, TimeRangeFilter } from './base';

export interface GetAllPricesResponse {
	prices: Price[];
	total: number;
	offset: number;
	limit: number;
}

export interface PriceFilter extends QueryFilter, TimeRangeFilter {
	price_ids?: string[];
	entity_type?: PRICE_ENTITY_TYPE;
	entity_ids?: string[];
	subscription_id?: string;
	parent_price_id?: string;
}

export interface CreatePriceRequest {
	amount?: string;
	currency: string;
	entity_type?: PRICE_ENTITY_TYPE;
	entity_id?: string;
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
	price_unit_config?: PriceUnitConfig;
}

export interface GetPriceResponse extends Price {
	plan: Plan;
	addon: Addon;
	feature: Feature;
	meter: Meter;
}

export interface CreatePriceTier {
	up_to?: number;
	unit_amount: string;
	flat_amount?: string;
}

export interface PriceUnitConfig {
	amount?: string;
	price_unit: string;
	price_unit_tiers?: CreatePriceTier[];
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
