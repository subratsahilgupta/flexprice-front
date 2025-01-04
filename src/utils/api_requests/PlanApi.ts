import { AxiosClient } from '@/core/axios/verbs';
import { Plan } from '@/models/Plan';
import { ExpandedPlan } from '../models/transformed_plan';

interface GetAllPlansResponse {
	plans: Plan[];
	total: number;
	offset: number;
	limit: number;
}

interface CreatePlanRequestPayload {
	description?: string;
	invoice_cadence: string;
	lookup_key: string;
	name: string;
	prices: {
		amount: string;
		billing_cadence: string;
		billing_model: string;
		billing_period: string;
		billing_period_count: number;
		currency: string;
		description: string;
		filter_values: Record<string, unknown>;
		lookup_key: string;
		metadata: Record<string, unknown>;
		meter_id: string;
		plan_id: string;
		tier_mode: string;
		tiers: {
			flat_amount: string;
			unit_amount: string;
			up_to: number;
		}[];
		transform_quantity: {
			divide_by: number;
			round: string;
		};
		type: string;
	}[];
	trial_period: number;
}

export class PlanApi {
	private static baseUrl = '/plans';

	public static async createPlan(data: CreatePlanRequestPayload) {
		return await AxiosClient.post<Plan, CreatePlanRequestPayload>(this.baseUrl, data);
	}

	public static async getAllPlans() {
		return await AxiosClient.get<GetAllPlansResponse>(this.baseUrl);
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
