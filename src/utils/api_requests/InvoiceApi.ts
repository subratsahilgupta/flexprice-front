import { AxiosClient } from '@/core/axios/verbs';
import { Invoice } from '@/models/Invoice';
import { generateQueryParams } from '../common/api_helper';
import { PaginationType } from '@/models/Pagination';

interface GetInvoicesResponse {
	items: Invoice[];
	pagination: PaginationType;
}

interface GetAllInvoicesPayload {
	customer_id?: string;
	end_time?: string;
	invoice_status?: string;
	invoice_type?: string;
	limit?: number;
	offset?: number;
	order?: string;
	payment_status?: string;
	start_time?: string;
	sort?: string;
	status?: string;
	subscription_id?: string;
}

interface UpdateInvoiceStatusPayload {
	invoiceId: string;
	payment_status?: string;
	amount?: number;
}

interface GetInvoicePreviewPayload {
	period_end: string;
	period_start: string;
	subscription_id: string;
}

class InvoiceApi {
	private static baseurl = '/invoices';

	public static async getCustomerInvoices(customerId: string): Promise<GetInvoicesResponse> {
		return await AxiosClient.get<GetInvoicesResponse>(`/invoices?customer_id=${customerId}`);
	}

	public static async getInvoiceById(invoiceId: string): Promise<Invoice> {
		return await AxiosClient.get<Invoice>(`${this.baseurl}/${invoiceId}`);
	}

	public static async updateInvoicePaymentStatus(invoiceId: string, status: string): Promise<Invoice> {
		return await AxiosClient.put<Invoice>(`${this.baseurl}/${invoiceId}/payment`, {
			payment_status: status,
		});
	}

	public static async getAllInvoices(query: GetAllInvoicesPayload = {}): Promise<GetInvoicesResponse> {
		const url = generateQueryParams(this.baseurl, query);
		return await AxiosClient.get<GetInvoicesResponse>(url);
	}

	public static async updateInvoiceStatus(payload: UpdateInvoiceStatusPayload): Promise<Invoice> {
		return await AxiosClient.put<Invoice>(`${this.baseurl}/${payload.invoiceId}/status`, payload);
	}

	public static async voidInvoice(invoiceId: string) {
		return await AxiosClient.post(`${this.baseurl}/${invoiceId}/void`);
	}

	public static async finalizeInvoice(invoiceId: string) {
		return await AxiosClient.post(`${this.baseurl}/${invoiceId}/finalize`);
	}

	public static async attemptPayment(invoiceId: string) {
		return await AxiosClient.post(`${this.baseurl}/${invoiceId}/payment/attempt`);
	}

	public static async getInvoicePreview(payload: GetInvoicePreviewPayload) {
		const url = generateQueryParams(`${this.baseurl}/preview`, payload);
		return await AxiosClient.get(url);
	}

	public static async getInvoicePdf(invoiceId: string) {
		return await AxiosClient.get(`${this.baseurl}/${invoiceId}/pdf`);
	}
}

export default InvoiceApi;
