import { AxiosClient } from '@/core/axios/verbs';
import { Integration } from '@/models/Integration';

interface CreateIntegrationRequest {
	provider: string;
	credentials: {
		key: string;
	};
	name: string;
}

class IntegrationsApi {
	private static baseUrl = '/secrets/integrations';

	public static async installIntegration(request: CreateIntegrationRequest) {
		return await AxiosClient.post(`${this.baseUrl}/${request.provider}`, request);
	}

	public static async getIntegration(provider: string) {
		return await AxiosClient.get<Integration>(`${this.baseUrl}/${provider}`);
	}
}

export default IntegrationsApi;
