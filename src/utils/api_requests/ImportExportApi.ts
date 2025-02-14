import { AxiosClient } from '@/core/axios/verbs';

class ImportExportApi {
	private static baseUrl = '/import-export';

	public static async importFile(data: any) {
		return await AxiosClient.post<any, any>(`${this.baseUrl}/import`, data);
	}
}

export default ImportExportApi;
