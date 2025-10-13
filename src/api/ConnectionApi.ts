import { AxiosClient } from '@/core/axios/verbs';
import { Connection, ENTITY_STATUS } from '@/models';
import { generateQueryParams } from '@/utils/common/api_helper';
import { GetConnectionsPayload, GetConnectionsResponse, CreateConnectionPayload, UpdateConnectionPayload } from '@/types/dto';

class ConnectionApi {
	private static baseUrl = '/connections';

	public static async getAllConnections(payload: GetConnectionsPayload = {}): Promise<GetConnectionsResponse> {
		const url = generateQueryParams(this.baseUrl, payload);
		return await AxiosClient.get<GetConnectionsResponse>(url);
	}

	public static async getConnectionById(id: string): Promise<Connection> {
		return await AxiosClient.get<Connection>(`${this.baseUrl}/${id}`);
	}

	public static async getPublishedConnections(): Promise<GetConnectionsResponse> {
		return this.getAllConnections({ status: ENTITY_STATUS.PUBLISHED });
	}

	public static async createConnection(payload: CreateConnectionPayload): Promise<Connection> {
		return await AxiosClient.post<Connection>(this.baseUrl, payload);
	}

	public static async updateConnection(id: string, payload: Partial<UpdateConnectionPayload>): Promise<Connection> {
		return await AxiosClient.put<Connection>(`${this.baseUrl}/${id}`, payload);
	}

	public static async deleteConnection(id: string): Promise<void> {
		return await AxiosClient.delete(`${this.baseUrl}/${id}`);
	}
}

export default ConnectionApi;
