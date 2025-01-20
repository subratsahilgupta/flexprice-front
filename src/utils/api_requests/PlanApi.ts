import { AxiosClient } from '@/core/axios/verbs';
import { Plan as PlanReq } from '@/store/usePlanStore';
import { Plan } from '@/models/Plan';
import { ExpandedPlan } from '../models/transformed_plan';

interface GetAllPlansResponse {
	items: Plan[] | ExpandedPlan[];
	pagination: PaginationType;
}

export class PlanApi {
	private static baseUrl = '/plans';

	public static async createPlan(data: Partial<PlanReq>) {
		return await AxiosClient.post<Plan, Partial<PlanReq>>(this.baseUrl, data);
	}

	public static async getAllPlans({ limit, offset }: PaginationType) {
		return await AxiosClient.get<GetAllPlansResponse>(`${this.baseUrl}?limit=${limit}&offset=${offset}`);
	}
	public static async getAllActivePlans() {
		return await AxiosClient.get<GetAllPlansResponse>(`${this.baseUrl}?status=published`);
	}

	public static async getExpandedPlan() {
		const response = await AxiosClient.get<GetAllPlansResponse>(`${this.baseUrl}?expand=prices%2Cmeters`);
		return response.items as ExpandedPlan[];
	}
	public static async getActiveExpandedPlan() {
		const response = await AxiosClient.get<GetAllPlansResponse>(`${this.baseUrl}?expand=prices%2Cmeters&status=published`);
		return response.items as ExpandedPlan[];
	}

	public static async getPlanById(id: string) {
		return await AxiosClient.get<ExpandedPlan>(`${this.baseUrl}/${id}`);
	}

	public static async updatePlan(id: string, data: Partial<Plan>) {
		return await AxiosClient.put<Plan, Partial<Plan>>(`${this.baseUrl}/${id}`, data);
	}

	public static async deletePlan(id: string) {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${id}`);
	}
}
