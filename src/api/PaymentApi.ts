import { AxiosClient } from '@/core/axios/verbs';
import { Payment } from '@/models';
import { generateQueryParams } from '@/utils/common/api_helper';
import { GetAllPaymentsPayload, GetAllPaymentsResponse, RecordPaymentPayload } from '@/types/dto';

class PaymentApi {
	private static baseUrl = '/payments';

	public static async createPayment(data: RecordPaymentPayload) {
		return await AxiosClient.post<Payment>(this.baseUrl, data);
	}

	public static async getPaymentById(id: string) {
		return await AxiosClient.get<Payment>(`${this.baseUrl}/${id}`);
	}

	public static async updatePayment(id: string, data: Partial<Payment>) {
		return await AxiosClient.put<Payment>(`${this.baseUrl}/${id}`, data);
	}

	public static async deletePayment(id: string) {
		return await AxiosClient.delete(`${this.baseUrl}/${id}`);
	}

	public static async getAllPayments(payload: GetAllPaymentsPayload) {
		const url = generateQueryParams(this.baseUrl, payload);
		return await AxiosClient.get<GetAllPaymentsResponse>(url);
	}

	public static async createSetupIntent(
		customerId: string,
		data: {
			success_url: string;
			cancel_url: string;
			provider: string;
			set_default?: boolean;
		},
	) {
		return await AxiosClient.post<{
			setup_intent_id: string;
			checkout_session_id: string;
			checkout_url: string;
			client_secret: string;
			status: string;
			usage: string;
			customer_id: string;
			created_at: number;
			expires_at: number;
		}>(`${this.baseUrl}/customers/${customerId}/setup/intent`, data);
	}

	// Moyasar autopay: returns a checkout_token JWT encoding publishable_key and payment_id.
	// Decode the JWT on the frontend to initialise Moyasar.js.
	public static async getMoyasarSetupIntent(customerId: string) {
		return await AxiosClient.post<{
			status: string;
			customer_id: string;
			checkout_token: string;
		}>(`${this.baseUrl}/customers/${customerId}/setup/intent`, { provider: 'moyasar' });
	}

	// Moyasar autopay: confirm the 1-SAR auth payment by linking the Moyasar gateway payment ID.
	// This transitions the Flexprice payment INITIATED → PENDING.
	// The webhook (payment_paid) will then save the token and mark it SUCCEEDED.
	public static async confirmMoyasarAuthPayment(flexpricePaymentId: string, gatewayPaymentId: string) {
		return await AxiosClient.put<Payment>(`${this.baseUrl}/${flexpricePaymentId}`, {
			gateway_payment_id: gatewayPaymentId,
		});
	}

	public static async processPayment(id: string): Promise<Payment> {
		return await AxiosClient.post<Payment>(`${this.baseUrl}/${id}/process`);
	}

	public static async getCustomerPaymentMethods(customerId: string) {
		return await AxiosClient.get(`${this.baseUrl}/customers/${customerId}/methods`);
	}
}

export default PaymentApi;
