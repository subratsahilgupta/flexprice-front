import { AxiosClient } from '@/core/axios/verbs';
import { Price } from '@/models/Price';
import { GetAllPricesResponse, CreatePriceRequest, UpdatePriceRequest } from '@/types/dto';

export class PriceApi {
	private static baseUrl = '/prices';

	public static async getAllPrices() {
		return await AxiosClient.get<GetAllPricesResponse>(this.baseUrl);
	}

	public static async getPriceById(id: string) {
		return await AxiosClient.get<Price>(`${this.baseUrl}/${id}`);
	}

	public static async createPrice(data: CreatePriceRequest) {
		return await AxiosClient.post<Price>(this.baseUrl, data);
	}

	public static async updatePrice(id: string, data: UpdatePriceRequest) {
		return await AxiosClient.put<Price>(`${this.baseUrl}/${id}`, data);
	}

	public static async deletePrice(id: string) {
		return await AxiosClient.delete(`${this.baseUrl}/${id}`);
	}
}
