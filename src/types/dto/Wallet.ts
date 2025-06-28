import { Metadata } from '@/models/base';
import { Pagination } from '@/models/Pagination';
import { WALLET_TRANSACTION_REASON } from '@/models/Wallet';
import { WalletTransaction } from '@/models/WalletTransaction';

export interface WalletTransactionResponse {
	items: WalletTransaction[];
	pagination: Pagination;
}

export interface CreateWalletPayload {
	customerId: string;
	currency: string;
	name?: string;
	metadata?: Metadata;
	initial_credits_to_load?: number;
	conversion_rate?: number;
	initial_credits_expiry_date_utc?: Date;
}

export interface TopupWalletPayload {
	credits_to_add: number;
	walletId: string;
	description?: string;
	priority?: number;
	expiry_date?: number;
	expiry_date_utc?: Date;
	metadata?: Record<string, any>;
	idempotency_key: string;
	transaction_reason: WALLET_TRANSACTION_REASON;
}

export interface WalletTransactionPayload extends Pagination {
	walletId: string;
}

export interface GetCustomerWalletsPayload {
	id?: string;
	lookup_key?: string;
	include_real_time_balance?: boolean;
}

// [
// 	{
// 	  "auto_topup_amount": 123,
// 	  "auto_topup_min_balance": 123,
// 	  "auto_topup_trigger": "disabled",
// 	  "balance": 123,
// 	  "config": {
// 		"allowed_price_types": [
// 		  "ALL"
// 		]
// 	  },
// 	  "conversion_rate": 123,
// 	  "created_at": "<string>",
// 	  "credit_balance": 123,
// 	  "currency": "<string>",
// 	  "customer_id": "<string>",
// 	  "description": "<string>",
// 	  "id": "<string>",
// 	  "metadata": {},
// 	  "name": "<string>",
// 	  "updated_at": "<string>",
// 	  "wallet_status": "active",
// 	  "wallet_type": "PROMOTIONAL"
// 	}
//   ]

export interface GetCustomerWalletsResponse {
	auto_topup_amount: number;
	auto_topup_min_balance: number;
	auto_topup_trigger: string;
	balance: number;
	config: {
		allowed_price_types: string[];
	};
	conversion_rate: number;
	created_at: string;
	credit_balance: number;
	currency: string;
	customer_id: string;
	description: string;
	id: string;
	metadata: Record<string, any>;
	name: string;
	updated_at: string;
	wallet_status: string;
	wallet_type: string;
}
