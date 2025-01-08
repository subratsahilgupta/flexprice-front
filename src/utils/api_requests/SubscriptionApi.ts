import { AxiosClient } from '@/core/axios/verbs';
import { SubscriptionUsage } from '@/models/Subscription';

class SubscriptionApi {
	private static baseUrl = '/subscriptions';

	public static async getSubscriptionUsage(id: string): Promise<SubscriptionUsage> {
		return await AxiosClient.post(`${this.baseUrl}/usage`, { subscription_id: id });
	}
}

export default SubscriptionApi;
