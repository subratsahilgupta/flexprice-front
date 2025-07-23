import { Subscription } from '@/models/Subscription';
import CustomerUsage from '@/models/CustomerUsage';
import { Pagination } from '@/models/Pagination';
import { TenantBillingDetails } from '@/models/Tenant';
import { Metadata } from '@/models/base';

export interface GetBillingdetailsResponse {
	subscriptions: Subscription[];
	usage: {
		customer_id: string;
		features: CustomerUsage[];
		pagination: Pagination;
		period: {
			end_time: string;
			period: string;
			start_time: string;
		};
	};
}

export interface UpdateTenantRequest {
	readonly name?: string;
	readonly billing_details?: TenantBillingDetails;
	readonly metadata?: Metadata;
}
