import { AxiosClient } from '@/core/axios/verbs';
import { Wallet, TransactionReason } from '@/models/Wallet';
import { WalletBalance } from '@/models/WalletBalance';
import { WalletTransaction } from '@/models/WalletTransaction';
import { PaginationType } from '@/models/Pagination';

interface WalletTransactionPayload extends PaginationType {
	walletId: string;
}
interface WalletTransactionResponse {
	items: WalletTransaction[];
	pagination: PaginationType;
}

interface CreateWalletPayload {
	customerId: string;
	currency: string;
	name?: string;
}

interface TopupWalletPayload {
	amount?: number;
	walletId: string;
	description?: string;
	expiry_date?: number;
	metadata?: Record<string, any>;
	idempotency_key: string;
	transaction_reason: TransactionReason;
}

class WalletApi {
	static async getWallets(customerId: string): Promise<Wallet[]> {
		return await AxiosClient.get<Wallet[]>(`/customers/${customerId}/wallets`);
	}

	static async getWalletTransactions({ walletId, limit = 10, offset = 0 }: WalletTransactionPayload): Promise<WalletTransactionResponse> {
		return await AxiosClient.get<WalletTransactionResponse>(`/wallets/${walletId}/transactions?limit=${limit}&offset=${offset}`);
	}

	static async getWalletBalance(walletId: string): Promise<WalletBalance> {
		return await AxiosClient.get<WalletBalance>(`/wallets/${walletId}/balance/real-time`);
	}
	static async createWallet({ currency, customerId, name }: CreateWalletPayload): Promise<Wallet> {
		return await AxiosClient.post<Wallet>(`/wallets`, {
			currency,
			customer_id: customerId,
			name,
		});
	}

	static async topupWallet({
		walletId,
		amount,
		idempotency_key,
		transaction_reason,
		description,
		expiry_date,
		metadata,
	}: TopupWalletPayload): Promise<Wallet> {
		return await AxiosClient.post<Wallet>(`/wallets/${walletId}/top-up`, {
			amount,
			idempotency_key,
			transaction_reason,
			description,
			expiry_date,
			metadata,
		});
	}

	static async terminateWallet(walletId: string): Promise<void> {
		return await AxiosClient.post<void>(`/wallets/${walletId}/terminate`);
	}
}

export default WalletApi;
