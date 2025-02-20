import { AxiosClient } from '@/core/axios/verbs';
import { Wallet } from '@/models/Wallet';
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

	static async topupWallet({ walletId, amount }: TopupWalletPayload): Promise<Wallet> {
		return await AxiosClient.post<Wallet>(`/wallets/${walletId}/top-up`, {
			amount,
		});
	}
}

export default WalletApi;
