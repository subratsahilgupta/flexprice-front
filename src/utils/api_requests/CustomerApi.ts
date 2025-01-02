import { AxiosClient } from '@/core/axios/verbs';
import Customer from '@/models/Customer';

interface GetCustomerResponse {
	customers: Customer[];
	limit: number;
	offset: number;
	total: number;
}

class CustomerApi {
	private static baseUrl = '/customers';

	public static async getAllCustomers(): Promise<GetCustomerResponse> {
		return await AxiosClient.get(`${this.baseUrl}?status=published`);
	}

	public static async deleteCustomerById(id: string): Promise<void> {
		return await AxiosClient.delete(`${this.baseUrl}/${id}`);
	}
}

export default CustomerApi;
