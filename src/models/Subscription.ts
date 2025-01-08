import { Plan } from './Plan';

export interface Subscription {
	readonly id: string;
	readonly lookup_key: string;
	readonly customer_id: string;
	readonly plan_id: string;
	readonly subscription_status: string;
	readonly currency: string;
	readonly billing_anchor: Date;
	readonly start_date: Date;
	readonly end_date: Date;
	readonly current_period_start: Date;
	readonly current_period_end: Date;
	readonly cancelled_at: null;
	readonly cancel_at: null;
	readonly cancel_at_period_end: boolean;
	readonly trial_start: null;
	readonly trial_end: null;
	readonly billing_cadence: string;
	readonly billing_period: string;
	readonly billing_period_count: number;
	readonly invoice_cadence: string;
	readonly version: number;
	readonly tenant_id: string;
	readonly status: string;
	readonly created_at: Date;
	readonly updated_at: Date;
	readonly created_by: string;
	readonly updated_by: string;
	readonly plan: Plan;
}

export interface SubscriptionUsage {
	readonly amount: number;
	readonly currency: string;
	readonly display_amount: string;
	readonly start_time: Date;
	readonly end_time: Date;
	readonly charges: Charge[];
}

export interface Charge {
	readonly amount: number;
	readonly currency: string;
	readonly display_amount: string;
	readonly quantity: number;
	readonly meter_display_name: string;
}
