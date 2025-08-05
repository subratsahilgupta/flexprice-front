import { Price } from '@/models/Price';
import { Entitlement } from '@/models/Entitlement';
import { Meter } from '@/models/Meter';

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
