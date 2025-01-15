import { AxiosClient } from '@/core/axios/verbs';
import { Wallet } from '@/models/Wallet';
import { WalletBalance } from '@/models/WalletBalance';
import { WalletTransaction } from '@/models/WalletTransaction';

interface WalletTransactionPayload extends PaginationType {
	walletId: string;
}
interface WalletTransactionResponse {
	total: number;
	transactions: WalletTransaction[];
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
}

export default WalletApi;
