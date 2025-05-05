import { AxiosClient } from '@/core/axios/verbs';
import { Tenant } from '@/models/Tenant';
import { GetBillingdetailsResponse } from '@/types/dto';

class TenantApi {
	private static baseUrl = '/tenants';

	public static async getTenantById(id: string) {
		return await AxiosClient.get<Tenant>(`${this.baseUrl}/${id}`);
	}

	public static async updateTenant(data: Partial<Tenant>) {
		return await AxiosClient.put<Tenant, Partial<Tenant>>(`${this.baseUrl}/update`, data);
	}

	public static async getTenantBillingDetails() {
		return await AxiosClient.get<GetBillingdetailsResponse>(`${this.baseUrl}/billing`);
	}
}

export default TenantApi;
