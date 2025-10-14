import { BaseEntityStatus } from '../common';
import { Entitlement, ENTITLEMENT_ENTITY_TYPE, Pagination, Plan, Addon, Feature, BILLING_PERIOD, FEATURE_TYPE } from '@/models';

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

export interface CreateEntitlementRequest {
	plan_id?: string;
	feature_id: string;
	feature_type: FEATURE_TYPE;
	is_enabled?: boolean;
	usage_limit?: number | null;
	usage_reset_period?: BILLING_PERIOD;
	is_soft_limit?: boolean;
	static_value?: string;
	entity_type: ENTITLEMENT_ENTITY_TYPE;
	entity_id: string;
}

export interface CreateBulkEntitlementRequest {
	items: CreateEntitlementRequest[];
}

export interface CreateBulkEntitlementResponse {
	items: EntitlementResponse[];
}
