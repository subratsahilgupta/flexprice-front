import { AxiosClient } from '@/core/axios/verbs';

export interface User {
	id: string;
	name: string;
	email: string;
}

interface CreateUserRequest {
	name: string;
	email: string;
	password: string;
}

interface UpdateUserRequest {
	name?: string;
	email?: string;
}

export class UserService {
	private static baseUrl = '/users';

	// Fetch all users
	public static async getAllUsers(): Promise<User[]> {
		return await AxiosClient.get<User[]>(this.baseUrl);
	}

	// Fetch user by ID
	public static async getUserById(userId: string): Promise<User> {
		return await AxiosClient.get<User>(`${this.baseUrl}/${userId}`);
	}

	// Create a new user
	public static async createUser(data: CreateUserRequest): Promise<User> {
		return await AxiosClient.post<User, CreateUserRequest>(this.baseUrl, data);
	}

	// Update an existing user
	public static async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
		return await AxiosClient.patch<User, UpdateUserRequest>(`${this.baseUrl}/${userId}`, data);
	}

	// Delete a user
	public static async deleteUser(userId: string): Promise<void> {
		return await AxiosClient.delete<void>(`${this.baseUrl}/${userId}`);
	}

	public static async me(): Promise<User> {
		return await AxiosClient.get<User>(`${this.baseUrl}/me`);
	}
}
