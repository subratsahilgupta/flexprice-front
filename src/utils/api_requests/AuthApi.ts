import { AxiosClient } from '@/core/axios/verbs';

interface SignupData {
	email: string;
	password?: string;
	token?: string;
}

interface LoginData {
	email: string;
	password: string;
}

class AuthApi {
	private static baseUrl = '/auth';

	public static async login(email: string, password: string) {
		return await AxiosClient.post(`${this.baseUrl}/login`, { email, password } as LoginData);
	}

	public static async signup(data: SignupData) {
		return await AxiosClient.post(`${this.baseUrl}/signup`, data);
	}

	public static async logout() {
		return await AxiosClient.post(`${this.baseUrl}/logout`);
	}

	public static async verifyEmail(token: string) {
		return await AxiosClient.post(`${this.baseUrl}/signup/confirmation`, { token });
	}

	public static async resetPassword(token: string, newPassword: string) {
		return await AxiosClient.post(`${this.baseUrl}/reset-password`, { token, newPassword });
	}

	public static async refreshToken(refreshToken: string) {
		return await AxiosClient.post(`${this.baseUrl}/refresh-token`, { refreshToken });
	}

	public static async getUserProfile() {
		return await AxiosClient.get(`${this.baseUrl}/profile`);
	}

	public static async updateUserProfile(userData: any) {
		return await AxiosClient.put(`${this.baseUrl}/profile`, userData);
	}

	public static async resendVerificationEmail(email: string) {
		return await AxiosClient.post(`${this.baseUrl}/resend-verification`, { email });
	}
}

export default AuthApi;
