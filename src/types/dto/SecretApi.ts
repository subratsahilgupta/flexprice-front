import { Pagination, SecretKey } from '@/models';

export interface GetAllSecretKeysResponse {
	items: SecretKey[];
	pagination: Pagination;
}

export interface CreateSecretKeyPayload {
	name: string;
	permissions: string[];
	expires_at?: string;
	type: string;
}

export interface CreateSecretKeyResponse {
	api_key: string;
	secret: SecretKey;
}
