export interface WalletBalance {
	balance: number;
	balance_updated_at: string;
	created_at: string;
	created_by: string;
	currency: string;
	customer_id: string;
	description: string;
	id: string;
	metadata: Record<string, any>;
	real_time_balance: number;
	status: string;
	tenant_id: string;
	updated_at: string;
	updated_by: string;
	wallet_status: string;
}
