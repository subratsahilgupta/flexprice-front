export type Wallet = {
	readonly balance: number;
	readonly name: string;
	readonly created_at: string;
	readonly currency: string;
	readonly customer_id: string;
	readonly id: string;
	readonly metadata: Record<string, any>;
	readonly updated_at: string;
	readonly wallet_status: string;
};
