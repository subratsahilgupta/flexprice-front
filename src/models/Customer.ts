import { BaseModel } from './base';

export interface Customer extends BaseModel {
	address_city: string;
	address_country: string;
	address_line1: string;
	address_line2: string;
	address_postal_code: string;
	address_state: string;
	email: string;
	external_id: string;
	metadata: Record<string, unknown>;
	name: string;
	tenant_id: string;

	// TODO - add these to the backend
	phone: string;
	timezone: string;
}

export default Customer;
