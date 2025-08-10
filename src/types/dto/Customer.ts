import Customer from '@/models/Customer';
import { CustomerEntitlement } from '@/models/CustomerEntitlement';
import CustomerUsage from '@/models/CustomerUsage';
import { Pagination } from '@/models/Pagination';
import { Subscription } from '@/models/Subscription';
import { TypedBackendFilter, TypedBackendSort } from '../formatters/QueryBuilder';

export interface FilterCondition {
	field: string;
	operator: string;
	value: string;
}

export interface GetCustomerResponse {
	items: Customer[];
	pagination: Pagination;
}

export interface GetCustomerSubscriptionsResponse {
	items: Subscription[];
	pagination: Pagination;
}

export interface GetCustomerEntitlementsResponse {
	customer_id: string;
	features: CustomerEntitlement[];
}

export interface GetCustomerEntitlementPayload {
	customer_id: string;
	feature_id?: string;
}

export interface GetUsageSummaryResponse {
	customer_id: string;
	features: CustomerUsage[];
	pagination: Pagination;
	period: {
		end_time: string;
		period: string;
		start_time: string;
	};
}

// Subscription
export interface GetCustomerByFiltersPayload extends Pagination {
	filters: TypedBackendFilter[];
	sort: TypedBackendSort[];
}
