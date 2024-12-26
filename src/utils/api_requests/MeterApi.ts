import { MeterFormData } from '@/components/organisms';
import { AxiosClient } from '@/core/axios/verbs';

export interface Meter {
	aggregation: {
		field: string;
		type: any;
	};
	event_name: string;
	filters: Array<{
		key: string;
		values: string[];
	}>;
	id: string;
	name: string;
	reset_usage: string;
	status: string;
	tenant_id: string;
	updated_at: string;
	created_at: string;
}

export class MeterApi {
	private static baseUrl = '/meters';

	public static async createMeter(data: MeterFormData) {
		return await AxiosClient.post<Meter, MeterFormData>(this.baseUrl, data);
	}
	public static async getAllMeters() {
		return await AxiosClient.get<Meter[]>(this.baseUrl);
	}

	public static async getMeterById(id: string) {
		return await AxiosClient.get<Meter>(`${this.baseUrl}/${id}`);
	}
}
