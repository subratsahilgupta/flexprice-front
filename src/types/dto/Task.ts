import { ImportTask, Pagination, Metadata } from '@/models';

export interface AddTaskPayload {
	entity_type: string;
	file_type: string;
	file_url: string;
	task_type: string;
	file_name?: string;
	metadata?: Metadata;
}

export interface GetTasksPayload {
	created_by?: string;
	end_time?: string;
	expand?: string;
	limit?: number;
	offset?: number;
	order?: string;
	sort?: string;
	start_time?: string;
	status?: string;
	task_status?: string;
	task_type?: string;
}

export interface GetTasksResponse {
	items: ImportTask[];
	pagination: Pagination;
}
