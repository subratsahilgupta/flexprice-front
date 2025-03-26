export interface TenantAddress {
	address_line1: string;
	address_line2: string;
	address_city: string;
	address_state: string;
	address_postal_code: string;
	address_country: string;
}

export interface TenantBillingDetails {
	address: TenantAddress;
	email: string;
	help_email: string;
	phone: string;
}

export interface Tenant {
	id: string;
	name: string;
	billing_details: TenantBillingDetails;
	status: string;
	created_at: string;
	updated_at: string;
}
