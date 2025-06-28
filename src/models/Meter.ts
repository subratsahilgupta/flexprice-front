import { BaseModel } from './base';

export interface Meter extends BaseModel {
	readonly aggregation: {
		field: string;
		type: METER_AGGREGATION_TYPE;
		multiplier?: number;
	};
	readonly event_name: string;
	readonly filters: Array<{
		key: string;
		values: string[];
	}>;
	readonly name: string;
	readonly reset_usage: METER_USAGE_RESET_PERIOD;
}

export enum METER_USAGE_RESET_PERIOD {
	NEVER = 'NEVER',
	BILLING_PERIOD = 'BILLING_PERIOD',
}

export enum METER_AGGREGATION_TYPE {
	SUM = 'SUM',
	COUNT = 'COUNT',
	COUNT_UNIQUE = 'COUNT_UNIQUE',
	LATEST = 'LATEST',
	SUM_WITH_MULTIPLIER = 'SUM_WITH_MULTIPLIER',
}
