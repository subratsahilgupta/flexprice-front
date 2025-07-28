import { AxiosClient } from '@/core/axios/verbs';
import { Wallet } from '@/models/Wallet';
import { RealtimeWalletBalance } from '@/models/WalletBalance';
import {
	CreateWalletPayload,
	TopupWalletPayload,
	WalletTransactionResponse,
	WalletTransactionPayload,
	UpdateWalletRequest,
	WalletResponse,
} from '@/types/dto';
import { GetCustomerWalletsPayload } from '@/types/dto/Wallet';
import { generateQueryParams } from '@/utils/common/api_helper';

class WalletApi {
	private static baseUrl = '/wallets';

	static async getCustomerWallets(data: GetCustomerWalletsPayload): Promise<Wallet[]> {
		const url = generateQueryParams(`/customers${this.baseUrl}`, data);
		return await AxiosClient.get<Wallet[]>(url);
	}

	static async getWalletTransactions({ walletId, limit = 10, offset = 0 }: WalletTransactionPayload): Promise<WalletTransactionResponse> {
		return await AxiosClient.get<WalletTransactionResponse>(`${this.baseUrl}/${walletId}/transactions?limit=${limit}&offset=${offset}`);
	}

	static async getWalletBalance(walletId: string): Promise<RealtimeWalletBalance> {
		return await AxiosClient.get<RealtimeWalletBalance>(`${this.baseUrl}/${walletId}/balance/real-time`);
	}
	static async createWallet({
		currency,
		customerId,
		name,
		initial_credits_to_load,
		conversion_rate,
		initial_credits_expiry_date_utc,
	}: CreateWalletPayload): Promise<Wallet> {
		return await AxiosClient.post<Wallet>(`${this.baseUrl}`, {
			currency,
			customer_id: customerId,
			name,
			initial_credits_to_load,
			conversion_rate,
			initial_credits_expiry_date_utc,
		});
	}

	static async topupWallet(data: TopupWalletPayload): Promise<Wallet> {
		return await AxiosClient.post<Wallet>(`${this.baseUrl}/${data.walletId}/top-up`, {
			...data,
		});
	}

	static async terminateWallet(walletId: string): Promise<void> {
		return await AxiosClient.post<void>(`${this.baseUrl}/${walletId}/terminate`);
	}

	static async updateWallet(walletId: string, data: UpdateWalletRequest): Promise<WalletResponse> {
		return await AxiosClient.put<WalletResponse>(`${this.baseUrl}/${walletId}`, data);
	}
}

export default WalletApi;
