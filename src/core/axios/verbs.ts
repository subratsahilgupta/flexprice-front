import axiosClient from './config';
import { AxiosResponse } from 'axios';

export class AxiosClient {
	public static async get<T>(url: string): Promise<T> {
		const response: AxiosResponse<T> = await axiosClient.get(url);
		return response as T;
	}

	// T is the expected response type, D is the type of the data being sent
	public static async post<T, D = any>(url: string, data?: D): Promise<T> {
		const response: AxiosResponse<T> = await axiosClient.post(url, data);
		return response as T;
	}

	public static async patch<T, D = any>(url: string, data?: D): Promise<T> {
		const response: AxiosResponse<T> = await axiosClient.patch(url, data);
		return response as T;
	}

	public static async put<T, D = any>(url: string, data?: D): Promise<T> {
		const response: AxiosResponse<T> = await axiosClient.put(url, data);
		return response as T;
	}

	public static async delete<T>(url: string): Promise<T> {
		const response: AxiosResponse<T> = await axiosClient.delete(url);
		return response as T;
	}
}
