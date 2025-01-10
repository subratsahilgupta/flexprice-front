import { AxiosClient } from '@/core/axios/verbs';

class WalletApi {
	static async getWallets(customerId: string): Promise<Wallet[]> {
		return await AxiosClient.get<Wallet[]>(`/customers/${customerId}/wallets`);
	}
}

export default WalletApi;
