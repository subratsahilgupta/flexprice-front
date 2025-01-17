import { AxiosClient } from '@/core/axios/verbs';
import { Invoice } from '@/models/Invoice';

interface GetInvoicesResponse {
	items: Invoice[];
	pagination: PaginationType;
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
}
export default InvoiceApi;
