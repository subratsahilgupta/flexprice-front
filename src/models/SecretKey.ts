/**
 * Represents an API key in the system
 */
export interface SecretKey {
	created_at: string;
	display_id: string;
	expires_at?: string;
	id: string;
	last_used_at: string;
	name: string;
	permissions: string[];
	provider: string;
	status: string;
	type: string;
	updated_at: string;
}
