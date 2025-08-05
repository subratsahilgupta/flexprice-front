import { COUPON_TYPE, COUPON_CADENCE, CouponRules } from '@/types/common/Coupon';
import { QueryFilter } from './base';
import { Coupon } from '@/models/Coupon';
import { Pagination } from '@/models/Pagination';
import { TypedBackendFilter, TypedBackendSort } from '../formatters/QueryBuilder';

export interface CreateCouponRequest {
	name: string;
	redeem_after?: string;
	redeem_before?: string;
	max_redemptions?: number;
	rules?: CouponRules;
	amount_off?: string;
	percentage_off?: string;
	type: COUPON_TYPE;
	cadence: COUPON_CADENCE;
	duration_in_periods?: number;
	metadata?: Record<string, string>;
	currency?: string;
}

export interface UpdateCouponRequest {
	name?: string;
	metadata?: Record<string, string>;
}

export interface GetCouponResponse {
	data: Coupon;
}

export interface ListCouponsResponse {
	items: Coupon[];
	pagination: Pagination;
}

export interface CouponFilter extends Omit<QueryFilter, 'sort'> {
	filters?: TypedBackendFilter[];
	sort?: TypedBackendSort[];
	coupon_ids?: string[];
}
