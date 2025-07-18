import { BaseModel } from './base';

export enum TAX_RATE_TYPE {
	PERCENTAGE = 'percentage',
	FIXED = 'fixed',
}

export enum TAX_RATE_STATUS {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	DELETED = 'DELETED',
}

export enum TAX_RATE_SCOPE {
	INTERNAL = 'INTERNAL',
	EXTERNAL = 'EXTERNAL',
	ONETIME = 'ONETIME',
}

export enum TAXRATE_ENTITY_TYPE {
	CUSTOMER = 'customer',
	SUBSCRIPTION = 'subscription',
	INVOICE = 'invoice',
	TENANT = 'tenant',
}

export interface Tax extends BaseModel {
	readonly name: string;
	readonly description: string;
	readonly code: string;
	readonly tax_rate_status: TAX_RATE_STATUS;
	readonly tax_rate_type: TAX_RATE_TYPE;
	readonly scope: TAX_RATE_SCOPE;
	readonly percentage_value?: number;
	readonly fixed_value?: number;
	readonly metadata?: Record<string, string>;
}
