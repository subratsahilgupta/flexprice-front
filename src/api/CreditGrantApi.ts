import { AxiosClient } from '@/core/axios/verbs';
import { generateQueryParams } from '@/utils/common/api_helper';
import {
	CreateCreditGrantRequest,
	UpdateCreditGrantRequest,
	CreditGrantResponse,
	ListCreditGrantsResponse,
	GetCreditGrantsRequest,
	ProcessScheduledCreditGrantApplicationsResponse,
} from '@/types/dto';

class CreditGrantApi {
	private static baseUrl = '/creditgrants';

	public static async createCreditGrant(data: CreateCreditGrantRequest) {
		return AxiosClient.post<CreditGrantResponse, CreateCreditGrantRequest>(this.baseUrl, data);
	}

	public static async getGrantCredits(data: GetCreditGrantsRequest) {
		const url = generateQueryParams(this.baseUrl, data);
		return await AxiosClient.get<ListCreditGrantsResponse>(url);
	}

	public static async updateCreditGrant(id: string, data: UpdateCreditGrantRequest) {
		return await AxiosClient.put<CreditGrantResponse, UpdateCreditGrantRequest>(`${this.baseUrl}/${id}`, data);
	}

	public static async deleteCreditGrant(id: string) {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${id}`);
	}

	public static async getCreditGrants(data: GetCreditGrantsRequest) {
		const url = generateQueryParams(this.baseUrl, data);
		return await AxiosClient.get<ListCreditGrantsResponse>(url);
	}

	public static async getCreditGrantById(id: string) {
		return await AxiosClient.get<CreditGrantResponse>(`${this.baseUrl}/${id}`);
	}

	public static async processScheduledCreditGrantApplications() {
		return await AxiosClient.post<ProcessScheduledCreditGrantApplicationsResponse>(`${this.baseUrl}/process-scheduled`);
	}
}

export default CreditGrantApi;
