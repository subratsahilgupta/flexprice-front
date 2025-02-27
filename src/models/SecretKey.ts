/**
 * Represents an API key in the system
 */
export interface SecretKey {
	readonly created_at: string;
	readonly display_id: string;
	readonly expires_at: string;
	readonly id: string;
	readonly last_used_at: string;
	readonly name: string;
	readonly permissions: readonly string[];
	readonly provider: string;
	readonly status: string;
	readonly type: string;
	readonly updated_at: string;
}
