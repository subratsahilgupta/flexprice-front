export interface Meter {
	aggregation: {
		field: string;
		type: string;
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

export enum MeterResetPeriod {
	NEVER = 'NEVER',
	RESET_PERIOD = 'RESET_PERIOD',
}
