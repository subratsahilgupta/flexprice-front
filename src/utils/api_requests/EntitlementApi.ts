import { AxiosClient } from '@/core/axios/verbs';
import { Entitlement } from '@/models/Entitlement';
import { generateQueryParams } from '../common/api_helper';

interface EntitlementFilters {
	end_time?: string;
	expand?: string;
	feature_ids?: string[];
	feature_type?: 'metered' | 'boolean' | 'static';
	is_enabled?: boolean;
	limit?: number;
	offset?: number;
	order?: 'asc' | 'desc';
	plan_ids?: string[];
	sort?: string;
	start_time?: string;
	status?: 'published' | 'deleted' | 'archived';
}

class EntitlementApi {
	private static baseUrl = '/entitlements';

	public static async getEntitlements(filters: EntitlementFilters) {
		const url = generateQueryParams(this.baseUrl, filters);
		return await AxiosClient.get<Entitlement[]>(url);
	}
}

export default EntitlementApi;
