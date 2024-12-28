import { AxiosClient } from '@/core/axios/verbs';
import { Plan } from '@/models/Plan';

interface GetAllPlansResponse {
	plans: Plan[];
	total: number;
	offset: number;
	limit: number;
}

export class PlanApi {
	private static baseUrl = '/plans';

	public static async createPlan(data: Partial<Plan>) {
		return await AxiosClient.post<Plan, Partial<Plan>>(this.baseUrl, data);
	}

	public static async getAllPlans() {
		return await AxiosClient.get<GetAllPlansResponse>(this.baseUrl);
	}

	public static async getPlanById(id: string) {
		return await AxiosClient.get<Plan>(`${this.baseUrl}/${id}`);
	}

	public static async updatePlan(id: string, data: Partial<Plan>) {
		return await AxiosClient.put<Plan, Partial<Plan>>(`${this.baseUrl}/${id}`, data);
	}

	public static async deletePlan(id: string) {
		return await AxiosClient.delete<Plan>(`${this.baseUrl}/${id}`);
	}
}
