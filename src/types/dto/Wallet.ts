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
