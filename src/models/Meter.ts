export interface Meter {
	aggregation: {
		field: string;
		type: METER_AGGREGATION_TYPE;
		multiplier?: number;
	};
	event_name: string;
	filters: Array<{
		key: string;
		values: string[];
	}>;
	name: string;
	id: string;
	reset_usage: string;
	status: string;
	tenant_id: string;
	updated_at: string;
	created_at: string;
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
