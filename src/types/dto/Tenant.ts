import { Subscription } from '@/models/Subscription';
import CustomerUsage from '@/models/CustomerUsage';
import { Pagination } from '@/models/Pagination';

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
