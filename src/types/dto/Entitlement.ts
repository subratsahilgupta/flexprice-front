import { BaseEntityStatus } from '../common';
import { Entitlement, ENTITLEMENT_ENTITY_TYPE } from '@/models/Entitlement';
import { Pagination } from '@/models/Pagination';
import { Plan } from '@/models/Plan';
import Addon from '@/models/Addon';
import Feature from '@/models/Feature';

export interface EntitlementFilters {
	end_time?: string;
	expand?: string;
	feature_ids?: string[];
	feature_type?: 'metered' | 'boolean' | 'static';
	is_enabled?: boolean;
	limit?: number;
	offset?: number;
	order?: 'asc' | 'desc';
	entity_type?: ENTITLEMENT_ENTITY_TYPE;
	entity_ids?: string[];
	sort?: string;
	start_time?: string;
	status?: BaseEntityStatus;
}

export interface EntitlementResponse extends Entitlement {
	feature: Feature;
	plan?: Plan;
	addon?: Addon;
}

export interface EntitlementResponse {
	items: EntitlementResponse[];
	pagination: Pagination;
}
