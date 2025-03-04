import { Entitlement } from './Entitlement';
import { Price } from './Price';

export interface Plan {
	created_at: string;
	created_by: string;
	description: string;
	id: string;
	lookup_key: string;
	name: string;
	status: string;
	entitlements: Entitlement[];
	prices: Price[];
	tenant_id: string;
	updated_at: string;
	updated_by: string;
}
