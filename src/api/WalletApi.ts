import { AxiosClient } from '@/core/axios/verbs';
import { Wallet } from '@/models/Wallet';
import { RealtimeWalletBalance } from '@/models/WalletBalance';
import { CreateWalletPayload, TopupWalletPayload, WalletTransactionResponse, WalletTransactionPayload } from '@/types/dto';
import { GetCustomerWalletsPayload } from '@/types/dto/Wallet';
import { generateQueryParams } from '@/utils/common/api_helper';

class WalletApi {
	private static baseUrl = '/wallets';

	static async getCustomerWallets(data: GetCustomerWalletsPayload): Promise<Wallet[]> {
		const url = generateQueryParams(`/customers${this.baseUrl}`, data);
		return await AxiosClient.get<Wallet[]>(url);
	}

	static async getWalletTransactions({ walletId, limit = 10, offset = 0 }: WalletTransactionPayload): Promise<WalletTransactionResponse> {
		return await AxiosClient.get<WalletTransactionResponse>(`/wallets/${walletId}/transactions?limit=${limit}&offset=${offset}`);
	}

	static async getWalletBalance(walletId: string): Promise<RealtimeWalletBalance> {
		return await AxiosClient.get<RealtimeWalletBalance>(`/wallets/${walletId}/balance/real-time`);
	}
	static async createWallet({
		currency,
		customerId,
		name,
		initial_credits_to_load,
		conversion_rate,
		initial_credits_expiry_date_utc,
	}: CreateWalletPayload): Promise<Wallet> {
		return await AxiosClient.post<Wallet>(`/wallets`, {
			currency,
			customer_id: customerId,
			name,
			initial_credits_to_load,
			conversion_rate,
			initial_credits_expiry_date_utc,
		});
	}

	static async topupWallet(data: TopupWalletPayload): Promise<Wallet> {
		return await AxiosClient.post<Wallet>(`/wallets/${data.walletId}/top-up`, {
			...data,
		});
	}

	static async terminateWallet(walletId: string): Promise<void> {
		return await AxiosClient.post<void>(`/wallets/${walletId}/terminate`);
	}
}

export default WalletApi;
