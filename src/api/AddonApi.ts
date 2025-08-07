import { AxiosClient } from '@/core/axios/verbs';
import Addon from '@/models/Addon';
import { generateQueryParams } from '@/utils/common/api_helper';
import { CreateAddonRequest, UpdateAddonRequest, GetAddonsPayload, GetAddonsResponse, GetAddonByFilterPayload } from '@/types/dto/Addon';

class AddonApi {
	private static baseUrl = '/addons';

	public static async getAllAddons(payload: GetAddonsPayload = {}): Promise<GetAddonsResponse> {
		const url = generateQueryParams(this.baseUrl, {
			...payload,
			expand: 'prices,entitlements',
		});
		return await AxiosClient.get<GetAddonsResponse>(url);
	}

	public static async getAddonById(id: string) {
		return await AxiosClient.get<Addon>(`${this.baseUrl}/${id}`);
	}

	public static async getAddonByLookupKey(lookupKey: string) {
		return await AxiosClient.get<Addon>(`${this.baseUrl}/lookup/${lookupKey}`);
	}

	public static async createAddon(data: CreateAddonRequest) {
		return await AxiosClient.post<Addon, CreateAddonRequest>(this.baseUrl, data);
	}

	public static async updateAddon(id: string, data: UpdateAddonRequest) {
		return await AxiosClient.put<Addon, UpdateAddonRequest>(`${this.baseUrl}/${id}`, data);
	}

	public static async deleteAddon(id: string) {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${id}`);
	}

	public static async getAddonsByFilter(payload: GetAddonByFilterPayload) {
		return await AxiosClient.post<GetAddonsResponse, GetAddonByFilterPayload>(`${this.baseUrl}/search`, payload);
	}

	public static async addAddonToSubscription(
		subscriptionId: string,
		data: { addon_id: string; start_date?: string; end_date?: string; metadata?: Record<string, any> },
	) {
		return await AxiosClient.post<any, any>(`/subscriptions/${subscriptionId}/addons`, data);
	}

	public static async removeAddonFromSubscription(subscriptionId: string, addonId: string) {
		return await AxiosClient.delete<void>(`/subscriptions/${subscriptionId}/addons/${addonId}`);
	}
}

export default AddonApi;
