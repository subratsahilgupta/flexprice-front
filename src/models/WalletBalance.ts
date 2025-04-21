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

export interface RealtimeWalletBalance {
	readonly id: string;
	readonly customer_id: string;
	readonly currency: string;
	readonly balance: string;
	readonly credit_balance: string;
	readonly wallet_status: string;
	readonly name: string;
	readonly description: string;
	readonly metadata: Record<string, any>;
	readonly auto_topup_trigger: string;
	readonly auto_topup_min_balance: string;
	readonly auto_topup_amount: string;
	readonly wallet_type: string;
	readonly config: {
		readonly allowed_price_types: readonly string[];
	};
	readonly conversion_rate: string;
	readonly environment_id: string;
	readonly tenant_id: string;
	readonly status: string;
	readonly created_at: string;
	readonly updated_at: string;
	readonly created_by: string;
	readonly updated_by: string;
	readonly real_time_balance: string;
	readonly real_time_credit_balance: string;
	readonly balance_updated_at: string;
	readonly unpaid_invoice_amount: string;
	readonly current_period_usage: string;
}
