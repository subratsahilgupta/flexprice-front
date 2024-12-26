import { AxiosClient } from '@/core/axios/verbs';

export interface Meter {
	aggregation: {
		field: string;
		type: string;
	};
	event_name: string;
	filters: Array<{
		key: string;
		values: string[];
	}>;
	name: string;
	id: string;
	reset_usage: string;
	status: string;
	tenant_id: string;
	updated_at: string;
	created_at: string;
}

export class MeterApi {
	private static baseUrl = '/meters';

	public static async createMeter(data: Partial<Meter>) {
		return await AxiosClient.post<Meter, Partial<Meter>>(this.baseUrl, data);
	}
	public static async getAllMeters() {
		return await AxiosClient.get<Meter[]>(this.baseUrl);
	}

	public static async getMeterById(id: string) {
		return await AxiosClient.get<Meter>(`${this.baseUrl}/${id}`);
	}
}
