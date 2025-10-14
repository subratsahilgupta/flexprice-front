import {
	INVOICE_CADENCE,
	BILLING_CADENCE,
	LineItem as InvoiceLineItem,
	BILLING_CYCLE,
	SUBSCRIPTION_STATUS,
	SubscriptionPhase,
	SUBSCRIPTION_PRORATION_BEHAVIOR,
	SUBSCRIPTION_CANCELLATION_TYPE,
	CreditGrant,
	Metadata,
	Subscription,
	Pagination,
	BILLING_MODEL,
	TIER_MODE,
	CreatePriceTier,
	TransformQuantity,
} from '@/models';
import { BILLING_PERIOD } from '@/constants/constants';
import { QueryFilter, TimeRangeFilter } from './base';
import { AddAddonToSubscriptionRequest } from './Addon';

// Re-export existing enums for convenience
export { BILLING_PERIOD } from '@/constants/constants';

// SubscriptionFilter interface for listing subscriptions
export interface ListSubscriptionsPayload extends QueryFilter, TimeRangeFilter {
	subscription_ids?: string[];
	customer_id?: string;
	plan_id?: string;
	subscription_status?: SUBSCRIPTION_STATUS[];
	billing_cadence?: BILLING_CADENCE[];
	billing_period?: BILLING_PERIOD[];
	subscription_status_not_in?: SUBSCRIPTION_STATUS[];
	active_at?: string;
	with_line_items?: boolean;
	expand?: string;
	sort?: TypedBackendSort[];
	filters?: TypedBackendFilter[];
}

import { TaxRateOverride } from './tax';
import { TypedBackendFilter, TypedBackendSort } from '../formatters/QueryBuilder';

export interface GetSubscriptionDetailsPayload {
	subscription_id: string;
	period_end?: string;
	period_start?: string;
}

export interface GetSubscriptionPreviewResponse {
	amount_due: number;
	amount_paid: number;
	amount_remaining: number;
	billing_reason: string;
	billing_sequence: number;
	created_at: string;
	created_by: string;
	currency: string;
	customer_id: string;
	description: string;
	due_date: string;
	finalized_at: string;
	id: string;
	idempotency_key: string;
	invoice_number: string;
	invoice_pdf_url: string;
	invoice_status: string;
	invoice_type: string;
	line_items: InvoiceLineItem[];
	metadata: Metadata;
	paid_at: string;
	payment_status: string;
	period_end: string;
	period_start: string;
	status: string;
	subscription_id: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
	subtotal: number;
	total: number;
	version: number;
	voided_at: string;
	total_discount: number;
	total_tax: number;
}

export interface PauseSubscriptionPayload {
	dry_run?: boolean;
	metadata?: Metadata;
	pause_days?: number;
	pause_end?: string;
	pause_mode?: 'immediate';
	pause_start?: string;
	reason?: string;
}

export interface ResumeSubscriptionPayload {
	dry_run?: boolean;
	metadata?: Metadata;
	resume_mode?: 'immediate';
}

export interface SubscriptionPauseResponse {
	created_at: string;
	created_by: string;
	environment_id: string;
	id: string;
	metadata: Metadata;
	original_period_end: string;
	original_period_start: string;
	pause_end: string;
	pause_mode: any;
	pause_start: string;
	pause_status: any;
	reason: string;
	resume_mode: any;
	resumed_at: string;
	status: 'published';
	subscription_id: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
}

// Since both responses have the same structure, we can reuse the interface
export type SubscriptionResumeResponse = SubscriptionPauseResponse;

export interface AddSubscriptionPhasePayload {
	billing_cycle: BILLING_CYCLE;
	start_date: string | Date;
	end_date?: string | Date;
	credit_grants?: CreditGrant[];
	commitment_amount?: number;
	overage_factor?: number;
}

export interface ListSubscriptionsResponse extends QueryFilter, TimeRangeFilter {
	items: Subscription[];
	pagination: Pagination;
	sort: TypedBackendSort[];
	filters: TypedBackendFilter[];
}

export interface CreateSubscriptionPayload {
	customer_id: string;
	billing_cadence: BILLING_CADENCE;
	billing_period: BILLING_PERIOD;
	billing_period_count: number;
	currency: string;
	invoice_cadence: INVOICE_CADENCE;
	plan_id: string;
	start_date: string;
	end_date: string | null;
	lookup_key: string;
	trial_end: string | null;
	trial_start: string | null;
	billing_cycle?: BILLING_CYCLE;
	phases?: SubscriptionPhase[];
	credit_grants?: CreditGrant[];
	commitment_amount?: number;
	overage_factor?: number;
	override_line_items?: SubscriptionLineItemOverrideRequest[];
	subscription_coupons?: string[];
	addons?: AddAddonToSubscriptionRequest[];
	coupons?: string[];
	line_item_coupons?: Record<string, string[]>;
	tax_rate_overrides?: TaxRateOverride[];
}

export interface SubscriptionLineItemOverrideRequest {
	price_id: string;
	quantity?: number;
	amount?: number;
	billing_model?: BILLING_MODEL;
	tier_mode?: TIER_MODE;
	tiers?: CreatePriceTier[];
	transform_quantity?: TransformQuantity;
	tax_rate_overrides?: TaxRateOverride[];
}

export interface CancelSubscriptionPayload {
	proration_behavior?: SUBSCRIPTION_PRORATION_BEHAVIOR;
	cancellation_type?: SUBSCRIPTION_CANCELLATION_TYPE;
	reason?: string;
}
