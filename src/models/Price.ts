import { Meter } from './Meter';

export interface Price {
	readonly id: string;
	readonly amount: string;
	readonly display_amount: string;
	readonly currency: string;
	readonly plan_id: string;
	readonly type: string;
	readonly billing_period: string;
	readonly billing_period_count: number;
	readonly billing_model: string;
	readonly billing_cadence: string;
	readonly tier_mode: string;
	readonly tiers: null;
	readonly meter_id: string;
	readonly lookup_key: string;
	readonly description: string;
	readonly transform_quantity: any;
	readonly tenant_id: string;
	readonly status: string;
	readonly created_at: Date;
	readonly updated_at: Date;
	readonly created_by: string;
	readonly updated_by: string;
	readonly meter: Meter;
	invoice_cadence: string;
	trial_period: number;
}
