import { AxiosClient } from '@/core/axios/verbs';
import { WebhookDashboardResponse } from '@/types/dto/webhook';

class WebhookApi {
	/**
	 * Fetches the Svix dashboard URL for the given environment.
	 * Pass environmentId explicitly so the request is bound to the same environment as the query key/cache.
	 */
	static async getWebhookDashboardUrl(environmentId: string) {
		const baseUrl = '/webhooks';
		return AxiosClient.get<WebhookDashboardResponse>(`${baseUrl}/dashboard`, {
			headers: { 'X-Environment-ID': environmentId },
		});
	}
}

export default WebhookApi;
