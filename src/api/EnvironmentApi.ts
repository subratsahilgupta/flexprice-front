import { AxiosClient } from '@/core/axios/verbs';
import { ACTIVE_ENVIRONMENT_ID_KEY } from '@/hooks/useEnvironment';
import Environment from '@/models/Environment';
import { CreateEnvironmentPayload, ListEnvironmentResponse } from '@/types/dto/Environment';

class EnvironmentApi {
	private static baseUrl = '/environments';

	// API Methods
	public static async getAllEnvironments(): Promise<ListEnvironmentResponse> {
		try {
			return await AxiosClient.get<ListEnvironmentResponse>(this.baseUrl);
		} catch (error) {
			// Return empty environments to prevent UI crashes
			// Explicitly cast to match the expected type
			return { environments: [], total: 0 } as ListEnvironmentResponse;
		}
	}

	public static async getEnvironmentById(id: string): Promise<Environment | null> {
		try {
			return await AxiosClient.get<Environment>(`${this.baseUrl}/${id}`);
		} catch (error) {
			return null;
		}
	}

	public static async createEnvironment(payload: CreateEnvironmentPayload): Promise<Environment | null> {
		try {
			return await AxiosClient.post<Environment>(this.baseUrl, payload);
		} catch (error) {
			return null;
		}
	}

	public static getActiveEnvironmentId(): string | null {
		return localStorage.getItem(ACTIVE_ENVIRONMENT_ID_KEY);
	}

	public static setActiveEnvironmentId(environmentId: string): void {
		localStorage.setItem(ACTIVE_ENVIRONMENT_ID_KEY, environmentId);
	}
}

export default EnvironmentApi;
