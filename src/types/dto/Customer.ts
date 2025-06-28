import Customer from '@/models/Customer';
import { CustomerEntitlement } from '@/models/CustomerEntitlement';
import CustomerUsage from '@/models/CustomerUsage';
import { Pagination } from '@/models/Pagination';
import { Subscription, BILLING_CYCLE, SubscriptionPhase } from '@/models/Subscription';
import { CreditGrant } from '@/models/CreditGrant';
import { TypedBackendFilter, TypedBackendSort } from '../formatters/QueryBuilder';
import { BILLING_PERIOD } from '@/constants/constants';
import { BILLING_CADENCE } from '@/models/Invoice';
import { INVOICE_CADENCE } from '@/models/Invoice';

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

export interface CreateCustomerSubscriptionPayload {
	customer_id: string;
	billing_cadence: BILLING_CADENCE;
	billing_period: BILLING_PERIOD;
	billing_period_count: number;
	currency: string;
	invoice_cadence: INVOICE_CADENCE;
	plan_id: string;
	start_date: string;
	end_date: string | null;
	lookup_key: string;
	trial_end: string | null;
	trial_start: string | null;
	billing_cycle?: BILLING_CYCLE;
	phases?: SubscriptionPhase[];
	credit_grants?: CreditGrant[];
	commitment_amount?: number;
	overage_factor?: number;
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
