interface Customer {
	address_city: string;
	address_country: string;
	address_line1: string;
	address_line2: string;
	address_postal_code: string;
	address_state: string;
	created_at: string;
	created_by: string;
	email: string;
	external_id: string;
	id: string;
	metadata: Record<string, unknown>;
	name: string;
	status: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;

	// TODO - these are only in frontend add them in backend as well
	phone: string;
	timezone: string;
}

export default Customer;
