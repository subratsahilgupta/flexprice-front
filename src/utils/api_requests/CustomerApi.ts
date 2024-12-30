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
		return await AxiosClient.get(this.baseUrl);
	}
}

export default CustomerApi;
