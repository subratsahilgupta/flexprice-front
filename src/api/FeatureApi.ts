import { AxiosClient } from '@/core/axios/verbs';
import { generateQueryParams } from '@/utils/common/api_helper';
import {
	CreateFeatureRequest,
	UpdateFeatureRequest,
	FeatureResponse,
	ListFeaturesResponse,
	GetFeaturesPayload,
	GetFeaturesResponse,
	GetFeatureByFilterPayload,
	UpdateFeaturePayload,
} from '@/types/dto';

class FeatureApi {
	private static baseUrl = '/features';

	public static async getAllFeatures(payload: GetFeaturesPayload = {}): Promise<GetFeaturesResponse> {
		const url = generateQueryParams(this.baseUrl, {
			...payload,
			expand: 'meters',
		});
		return await AxiosClient.get<GetFeaturesResponse>(url);
	}

	public static async getFeatureById(id: string) {
		const url = generateQueryParams(`${this.baseUrl}/${id}`, { expand: 'meter' });
		return await AxiosClient.get<FeatureResponse>(url);
	}

	public static async createFeature(data: CreateFeatureRequest) {
		return await AxiosClient.post<FeatureResponse, CreateFeatureRequest>(this.baseUrl, data);
	}

	public static async updateFeature(id: string, data: UpdateFeatureRequest) {
		return await AxiosClient.put<FeatureResponse, UpdateFeatureRequest>(`${this.baseUrl}/${id}`, data);
	}

	public static async deleteFeature(id: string) {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${id}`);
	}

	public static async getFeaturesByFilter(payload: GetFeatureByFilterPayload) {
		return await AxiosClient.post<GetFeaturesResponse, GetFeatureByFilterPayload>(`${this.baseUrl}/search`, payload);
	}

	public static async listFeatures(payload: GetFeaturesPayload = {}): Promise<ListFeaturesResponse> {
		const url = generateQueryParams(this.baseUrl, {
			...payload,
			expand: 'meter',
		});
		return await AxiosClient.get<ListFeaturesResponse>(url);
	}

	// Legacy method for backwards compatibility
	public static async updateFeatureLegacy(id: string, data: UpdateFeaturePayload) {
		return await AxiosClient.put<FeatureResponse, UpdateFeaturePayload>(`${this.baseUrl}/${id}`, data);
	}
}

export default FeatureApi;
