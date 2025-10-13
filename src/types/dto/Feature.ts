import { Pagination, Feature, FEATURE_TYPE, Metadata, Meter } from '@/models';
import { TypedBackendFilter, TypedBackendSort } from '../formatters/QueryBuilder';
import { MeterFilter, CreateMeterRequest } from './Meter';

// ============================================
// Feature Request Types
// ============================================

export interface CreateFeatureRequest {
	name: string;
	description?: string;
	lookup_key?: string;
	type: FEATURE_TYPE;
	meter_id?: string;
	meter?: CreateMeterRequest;
	metadata?: Metadata;
	unit_singular?: string;
	unit_plural?: string;
}

export interface UpdateFeatureRequest {
	name?: string;
	description?: string;
	metadata?: Metadata;
	unit_singular?: string;
	unit_plural?: string;
	filters?: MeterFilter[];
}

// ============================================
// Feature Response Types
// ============================================

export interface FeatureResponse extends Feature {
	meter?: Meter;
}

export interface ListFeaturesResponse {
	items: FeatureResponse[];
	pagination: Pagination;
}

// ============================================
// Legacy Payload Types (for backwards compatibility)
// ============================================

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

// Legacy update payload
export interface UpdateFeaturePayload extends Partial<Feature> {
	filters?: MeterFilter[];
}
