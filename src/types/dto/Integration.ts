import { Integration, Pagination } from '@/models';

export interface CreateIntegrationRequest {
	provider: string;
	credentials: {
		key: string;
	};
	name: string;
}

export interface LinkedinIntegrationResponse {
	providers: string[];
}

export interface IntegrationResponse {
	items: Integration[];
	pagination: Pagination;
}
