import { BaseEntityStatus } from '../common';

export interface QueryFilter {
	limit?: number;
	offset?: number;
	status?: BaseEntityStatus;
	sort?: string;
	order?: string;
	expand?: string;
}

export interface TimeRangeFilter {
	start_time?: string;
	end_time?: string;
}
