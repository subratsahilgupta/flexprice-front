import supabase from '../supbase/config';

export enum ProjectEnvironment {
	PROD = 'production',
	DEV = 'development',
	LOCAL = 'local',
}

class AuthService {
	private static readonly environment = import.meta.env.VITE_ENVIRONMENT;

	public static async getAcessToken() {
		if (this.environment != ProjectEnvironment.LOCAL) {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			return session?.access_token;
		} else {
			const token = JSON.parse(localStorage.getItem('sb-vnswkuldxqmqhyiewgsq-auth-token') || '{}').access_token;
			return token;
		}
	}

	public static async getUser() {
		if (this.environment != ProjectEnvironment.LOCAL) {
			const { data } = await supabase.auth.getUser();
			return data.user;
		} else {
			const user = JSON.parse(localStorage.getItem('sb-vnswkuldxqmqhyiewgsq-auth-token') || '{}').user;
			return user;
		}
	}

	public static async logout() {
		if (this.environment != ProjectEnvironment.LOCAL) {
			await supabase.auth.signOut();
		}
		localStorage.clear();
	}
}

export default AuthService;
