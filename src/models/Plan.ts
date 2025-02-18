import { Entitlement } from './Entitlement';
import { Price } from './Price';

export interface Plan {
	created_at: string;
	created_by: string;
	description: string;
	id: string;
	invoice_cadence: string;
	lookup_key: string;
	name: string;
	status: string;
	entitlements: Entitlement[];
	prices: Price[];
	tenant_id: string;
	trial_period: number;
	updated_at: string;
	updated_by: string;
}
