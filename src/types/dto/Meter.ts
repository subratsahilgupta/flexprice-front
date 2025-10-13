import { Meter, METER_AGGREGATION_TYPE, METER_USAGE_RESET_PERIOD, Pagination } from '@/models';

// ============================================
// Meter Request Types
// ============================================

export interface MeterFilter {
	key: string;
	value: string;
}

export interface CreateMeterRequest {
	name: string;
	event_name: string;
	aggregation: METER_AGGREGATION_TYPE;
	reset_usage: METER_USAGE_RESET_PERIOD;
	filters?: MeterFilter[];
}

export interface UpdateMeterRequest {
	filters?: MeterFilter[];
}

// ============================================
// Meter Response Types
// ============================================

export type MeterResponse = Meter;

export interface GetAllMetersResponse {
	items: Meter[];
	pagination: Pagination;
}

export interface ListMetersResponse {
	items: MeterResponse[];
	pagination: Pagination;
}
