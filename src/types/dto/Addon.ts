import { Pagination } from '@/models/Pagination';
import { TypedBackendFilter, TypedBackendSort } from '../formatters/QueryBuilder';
import Addon, { ADDON_TYPE } from '@/models/Addon';
import { QueryFilter, TimeRangeFilter } from './base';
import { FilterCondition } from '../common/QueryBuilder';
import { SortOption } from '../common/QueryBuilder';
import { Price } from '@/models/Price';
import { Entitlement } from '@/models/Entitlement';

export interface ExtendedAddon extends Addon {
	prices: Price[];
	entitlements: Entitlement[];
}

export interface CreateAddonRequest {
	name: string;
	lookup_key: string;
	description?: string;
	type: ADDON_TYPE;
	metadata?: Record<string, any>;
}

export interface AddonResponse extends Addon {
	prices: Price[];
	entitlements: Entitlement[];
}

export interface UpdateAddonRequest {
	name?: string;
	description?: string;
	metadata?: Record<string, any>;
}

export interface AddAddonToSubscriptionRequest {
	addon_id: string;
	start_date?: string;
	end_date?: string;
	metadata?: Record<string, any>;
}

export interface GetAddonsPayload {
	end_time?: string;
	expand?: string;
	addon_ids?: string[];
	limit?: number;
	lookup_key?: string;
	offset?: number;
	order?: string;
	sort?: string;
	start_time?: string;
	status?: string;
	addon_type?: ADDON_TYPE;
	lookup_keys?: string[];
}

export interface GetAddonsResponse extends Pagination {
	items: Addon[];
	pagination: Pagination;
}

export interface GetAddonByFilterPayload extends Pagination {
	filters: TypedBackendFilter[];
	sort: TypedBackendSort[];
}

export interface AddonFilter extends QueryFilter, TimeRangeFilter {
	filters?: FilterCondition[];
	sort?: SortOption[];
	addon_ids?: string[];
	addon_type?: ADDON_TYPE;
	lookup_keys?: string[];
}
