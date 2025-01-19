import { AxiosClient } from '@/core/axios/verbs';
import Customer from '@/models/Customer';
import { Subscription } from '@/models/Subscription';

interface GetCustomerResponse {
	items: Customer[];
	pagination: PaginationType;
}

interface GetCustomerSubscriptionsResponse {
	items: Subscription[];
	pagination: PaginationType;
}

export interface CreateCustomerSubscriptionPayload {
	customer_id: string;
	billing_cadence: 'RECURRING';
	billing_period: string;
	billing_period_count: number;
	currency: string;
	invoice_cadence: 'ARREAR';
	plan_id: string;
	start_date: string;
	end_date: string | null;
	lookup_key: string;
	trial_end: string | null;
	trial_start: string | null;
}

class CustomerApi {
	private static baseUrl = '/customers';

	public static async getCustomerById(id: string): Promise<Customer> {
		return await AxiosClient.get(`${this.baseUrl}/${id}`);
	}
	public static async getAllCustomers({ limit = 10, offset = 0 }: PaginationType): Promise<GetCustomerResponse> {
		return await AxiosClient.get(`${this.baseUrl}?limit=${limit}&offset=${offset}`);
	}

	public static async deleteCustomerById(id: string): Promise<void> {
		return await AxiosClient.delete(`${this.baseUrl}/${id}`);
	}

	public static async createCustomerSubscription(payload: CreateCustomerSubscriptionPayload): Promise<void> {
		return await AxiosClient.post(`/subscriptions`, payload);
	}

	public static async getCustomerSubscriptions(id: string): Promise<GetCustomerSubscriptionsResponse> {
		return await AxiosClient.get(`/subscriptions?customer_id=${id}`);
	}

	public static async getCustomerSubscriptionById(id: string): Promise<Subscription> {
		return await AxiosClient.get(`/subscriptions/${id}`);
	}

	public static async createCustomer(customer: { email: string; external_id: string; name?: string }): Promise<Customer> {
		return await AxiosClient.post(`${this.baseUrl}`, customer);
	}
}

export default CustomerApi;
