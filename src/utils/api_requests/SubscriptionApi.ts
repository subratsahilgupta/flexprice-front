import { AxiosClient } from '@/core/axios/verbs';
import { LineItem } from '@/models/Invoice';
import { SubscriptionUsage } from '@/models/Subscription';

interface GetSubscriptionDetailsPaylaod {
	subscription_id: string;
	period_end?: string;
	period_start?: string;
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

interface SubscriptionPlan {
	created_at: string;
	created_by: string;
	description: string;
	id: string;
	invoice_cadence: string;
	lookup_key: string;
	name: string;
	prices: Price[];
	status: string;
	tenant_id: string;
	trial_period: number;
	updated_at: string;
	updated_by: string;
}

interface Price {
	amount: number;
	billing_cadence: string;
	billing_model: string;
	billing_period: string;
	billing_period_count: number;
	created_at: string;
	created_by: string;
	currency: string;
	description: string;
	display_amount: string;
	filter_values: Record<string, any>;
	id: string;
	lookup_key: string;
	metadata: Record<string, any>;
	meter: Meter;
	meter_id: string;
	plan_id: string;
	status: string;
	tenant_id: string;
	tier_mode: string;
	tiers: Tier[];
	transform_quantity: TransformQuantity;
	type: string;
	updated_at: string;
	updated_by: string;
}

interface Meter {
	aggregation: Aggregation;
	created_at: string;
	event_name: string;
	filters: Filter[];
	id: string;
	name: string;
	reset_usage: string;
	status: string;
	tenant_id: string;
	updated_at: string;
}

interface Aggregation {
	field: string;
	type: string;
}

interface Filter {
	key: string;
	values: string[];
}

interface Tier {
	flat_amount: number;
	unit_amount: number;
	up_to: number;
}

interface TransformQuantity {
	divide_by: number;
	round: string;
}

interface Subscription {
	billing_anchor: string;
	billing_cadence: string;
	billing_period: string;
	billing_period_count: number;
	cancel_at: string;
	cancel_at_period_end: boolean;
	cancelled_at: string;
	created_at: string;
	created_by: string;
	currency: string;
	current_period_end: string;
	current_period_start: string;
	customer_id: string;
	end_date: string;
	id: string;
	invoice_cadence: string;
	lookup_key: string;
	plan: SubscriptionPlan;
	plan_id: string;
	start_date: string;
	status: string;
	subscription_status: string;
	tenant_id: string;
	trial_end: string;
	trial_start: string;
	updated_at: string;
	updated_by: string;
	version: number;
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

	static async getSubscriptionById(id: string): Promise<Subscription> {
		return await AxiosClient.get(`${this.baseUrl}/${id}`);
	}
}

export default SubscriptionApi;
