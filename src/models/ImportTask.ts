import { BaseModel } from './base';

export interface ImportTask extends BaseModel {
	readonly task_type: string;
	readonly entity_type: string;
	readonly file_url: string;
	readonly file_name: string;
	readonly file_type: string;
	readonly task_status: string;
	readonly processed_records: number;
	readonly successful_records: number;
	readonly failed_records: number;
	readonly tenant_id: string;
	readonly completed_at: string;
	readonly error_summary: string;
	readonly failed_at: string;
	readonly metadata: Record<string, unknown>;
	readonly started_at: string;
	readonly total_records: number;
}
