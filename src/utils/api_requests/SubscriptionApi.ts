import { AxiosClient } from '@/core/axios/verbs';
import { SubscriptionUsage } from '@/models/Subscription';

interface GetSubscriptionDetailsPaylaod {
	subscription_id: string;
	period_end?: string;
	period_start?: string;
}

interface LineItem {
	amount: number;
	created_at: string;
	created_by: string;
	currency: string;
	customer_id: string;
	display_name: string;
	id: string;
	invoice_id: string;
	metadata: Record<string, any>;
	meter_display_name: string;
	meter_id: string;
	period_end: string;
	period_start: string;
	plan_display_name: string;
	plan_id: string;
	price_id: string;
	price_type: string;
	quantity: number;
	status: string;
	subscription_id: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
}

interface GetSubscriptionDetailsResponse {
	amount_due: number;
	amount_paid: number;
	amount_remaining: number;
	billing_reason: string;
	billing_sequence: number;
	created_at: string;
	created_by: string;
	currency: string;
	customer_id: string;
	description: string;
	due_date: string;
	finalized_at: string;
	id: string;
	idempotency_key: string;
	invoice_number: string;
	invoice_pdf_url: string;
	invoice_status: string;
	invoice_type: string;
	line_items: LineItem[];
	metadata: Record<string, any>;
	paid_at: string;
	payment_status: string;
	period_end: string;
	period_start: string;
	status: string;
	subscription_id: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
	version: number;
	voided_at: string;
}

class SubscriptionApi {
	private static baseUrl = '/subscriptions';

	public static async getSubscriptionUsage(id: string): Promise<SubscriptionUsage> {
		return await AxiosClient.post(`${this.baseUrl}/usage`, { subscription_id: id });
	}

	public static async getSubscriptionInvoicesPreview({
		subscription_id,
		period_end,
		period_start,
	}: GetSubscriptionDetailsPaylaod): Promise<GetSubscriptionDetailsResponse> {
		return await AxiosClient.post<GetSubscriptionDetailsResponse>('invoices/preview ', {
			subscription_id: subscription_id,
			period_end: period_end,
			period_start: period_start,
		});
	}
}

export default SubscriptionApi;
