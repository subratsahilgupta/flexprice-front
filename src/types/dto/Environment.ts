import { ENVIRONMENT_TYPE } from '@/models/Environment';
import { Pagination } from '@/models/Pagination';
import Environment from '@/models/Environment';

export interface UpdateEnvironmentPayload {
	name?: string;
	type?: ENVIRONMENT_TYPE;
}

export interface CreateEnvironmentPayload {
	name: string;
	type: ENVIRONMENT_TYPE;
}
export interface ListEnvironmentResponse extends Pagination {
	environments: Environment[];
}
