import Customer from './Customer';
import { BILLING_CADENCE, INVOICE_CADENCE } from './Invoice';
import { BILLING_PERIOD } from '@/constants/constants';
import { Plan } from './Plan';
import { CreditGrant } from './CreditGrant';
import { BaseModel, ENTITY_STATUS, Metadata } from './base';

export interface LineItem extends BaseModel {
	readonly subscription_id: string;
	readonly customer_id: string;
	readonly plan_id: string;
	readonly price_id: string;
	readonly meter_id: string;
	readonly environment_id: string;
	readonly tenant_id: string;
	readonly display_name: string;
	readonly plan_display_name: string;
	readonly meter_display_name: string;
	readonly price_type: string;
	readonly billing_period: string;
	readonly currency: string;
	readonly quantity: number;
	readonly start_date: string;
	readonly end_date: string;
	readonly metadata: Record<string, any>;
}

export interface Pause extends BaseModel {
	readonly id: string;
	readonly subscription_id: string;
	readonly environment_id: string;
	readonly tenant_id: string;
	readonly pause_start: string;
	readonly pause_end: string;
	readonly pause_status: PauseStatus;
	readonly pause_mode: SUBSCRIPTION_PAUSE_MODE;
	readonly resume_mode: RESUME_MODE;
	readonly reason: string;
	readonly original_period_start: string;
	readonly original_period_end: string;
	readonly resumed_at: string;
	readonly metadata: Record<string, any>;
	readonly status: ENTITY_STATUS;
}

export interface Subscription extends BaseModel {
	readonly id: string;
	readonly lookup_key: string;
	readonly customer_id: string;
	readonly plan_id: string;
	readonly environment_id: string;
	readonly tenant_id: string;
	readonly subscription_status: SUBSCRIPTION_STATUS;
	readonly currency: string;
	readonly billing_anchor: string;
	readonly start_date: string;
	readonly end_date: string;
	readonly current_period_start: string;
	readonly current_period_end: string;
	readonly cancelled_at: string;
	readonly cancel_at: string;
	readonly cancel_at_period_end: boolean;
	readonly trial_start: string;
	readonly trial_end: string;
	readonly billing_cadence: BILLING_CADENCE;
	readonly billing_period: BILLING_PERIOD;
	readonly billing_period_count: number;
	readonly invoice_cadence: INVOICE_CADENCE;
	readonly version: number;
	readonly active_pause_id: string;
	readonly pause_status: PauseStatus;
	readonly metadata: Metadata;
	readonly customer: Customer;
	readonly plan: Plan;
	readonly billing_cycle: BILLING_CYCLE;
	readonly line_items: LineItem[];
	readonly pauses: Pause[];

	// experimental fields
	credit_grants?: CreditGrant[];
	commitment_amount?: number;
	overage_factor?: number;

	// experimental fields
	readonly schedule: Schedule;
}

export interface SubscriptionUsage extends BaseModel {
	readonly amount: number;
	readonly currency: string;
	readonly display_amount: string;
	readonly start_time: Date;
	readonly end_time: Date;
	readonly charges: Charge[];
}

export interface Charge extends BaseModel {
	readonly amount: number;
	readonly currency: string;
	readonly display_amount: string;
	readonly quantity: number;
	readonly meter_display_name: string;
}

export enum BILLING_CYCLE {
	ANNIVERSARY = 'anniversary',
	CALENDAR = 'calendar',
}

export interface SubscriptionPhaseLineItem extends BaseModel {
	price_id: string;
	quantity?: number;
	override_amount?: string;
}

export interface SubscriptionPhase extends BaseModel {
	billing_cycle?: BILLING_CYCLE;
	start_date: Date | string;
	end_date: Date | null | string;
	line_items?: SubscriptionPhaseLineItem[];
	prorate_charges?: boolean;
	credit_grants?: CreditGrant[];
	commitment_amount?: number;
	overage_factor?: number;
}

export interface Schedule extends BaseModel {
	readonly id: string;
	readonly subscription_id: string;
	readonly status: ENTITY_STATUS;
	readonly current_phase_index: number;
	readonly end_behavior: string;
	readonly start_date: string;
	readonly phases: readonly SubscriptionPhase[];
	readonly metadata: Metadata;
}

export enum SUBSCRIPTION_STATUS {
	ACTIVE = 'active',
	PAUSED = 'paused',
	CANCELLED = 'cancelled',
	INCOMPLETE = 'incomplete',
	INCOMPLETE_EXPIRED = 'incomplete_expired',
	PAST_DUE = 'past_due',
	TRIALING = 'trialing',
	UNPAID = 'unpaid',
}

// PauseStatus represents the pause state of a subscription
export enum PauseStatus {
	// PauseStatusNone indicates the subscription is not paused
	PauseStatusNone = 'none',
	// PauseStatusActive indicates the subscription is currently paused
	PauseStatusActive = 'active',
	// PauseStatusScheduled indicates the subscription is scheduled to be paused
	PauseStatusScheduled = 'scheduled',
	// PauseStatusCompleted indicates the pause has been completed (subscription resumed)
	PauseStatusCompleted = 'completed',
	// PauseStatusCancelled indicates the pause was cancelled
	PauseStatusCancelled = 'cancelled',
}

export enum SUBSCRIPTION_PAUSE_MODE {
	IMMEDIATE = 'immediate',
	SCHEDULED = 'scheduled',
	PERIOD_END = 'period_end',
}

export enum RESUME_MODE {
	IMMEDIATE = 'immediate',
	SCHEDULED = 'scheduled',
	AUTO = 'auto',
}

/**
 * ProrationAction defines the type of change triggering proration.
 */
export enum SUBSCRIPTION_PRORATION_ACTION {
	UPGRADE = 'upgrade',
	DOWNGRADE = 'downgrade',
	QUANTITY_CHANGE = 'quantity_change',
	CANCELLATION = 'cancellation',
	ADD_ITEM = 'add_item',
	REMOVE_ITEM = 'remove_item',
}

/**
 * ProrationStrategy defines how the proration coefficient is calculated.
 */
export enum SUBSCRIPTION_PRORATION_STRATEGY {
	DAY_BASED = 'day_based', // Default
	SECOND_BASED = 'second_based', // Future enhancement
}

/**
 * ProrationBehavior defines how proration is applied (e.g., create invoice items).
 */
export enum SUBSCRIPTION_PRORATION_BEHAVIOR {
	CREATE_PRORATIONS = 'create_prorations', // Default: Create credits/charges on invoice
	NONE = 'none', // Calculate but don't apply (e.g., for previews)
}
