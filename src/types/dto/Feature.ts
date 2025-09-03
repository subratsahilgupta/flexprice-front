import { Pagination } from '@/models/Pagination';
import { TypedBackendFilter } from '../formatters/QueryBuilder';

import { TypedBackendSort } from '../formatters/QueryBuilder';
import { Feature } from '@/models/Feature';
import { EventFilterData } from '@/components/molecules';

export interface GetFeaturesPayload {
	end_time?: string;
	expand?: string;
	feature_ids?: string[];
	limit?: number;
	lookup_key?: string;
	offset?: number;
	order?: string;
	sort?: string;
	start_time?: string;
	status?: string;
}

export interface GetFeaturesResponse extends Pagination {
	items: Feature[];
	pagination: Pagination;
}

export interface GetFeatureByFilterPayload extends Pagination {
	filters: TypedBackendFilter[];
	sort: TypedBackendSort[];
}

export interface GetFeaturesPayload {
	end_time?: string;
	expand?: string;
	feature_ids?: string[];
	limit?: number;
	lookup_key?: string;
	offset?: number;
	order?: string;
	sort?: string;
	name_contains?: string;
	start_time?: string;
	status?: string;
}

export interface GetFeaturesResponse {
	items: Feature[];
	pagination: Pagination;
}

export interface GetFeatureByFilterPayload extends Pagination {
	filters: TypedBackendFilter[];
	sort: TypedBackendSort[];
}

export interface UpdateFeaturePayload extends Partial<Feature> {
	filters: EventFilterData[];
}
