import { NODE_ENV, NodeEnv } from '@/types/env';
import supabase from '../supbase/config';

class AuthService {
	public static async getAcessToken() {
		if (NODE_ENV != NodeEnv.SELF_HOSTED) {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			return session?.access_token;
		} else {
			const token = localStorage.getItem('token');
			console.log('token', token);
			return token;
		}
	}

	public static async getUser() {
		if (NODE_ENV != NodeEnv.SELF_HOSTED) {
			const { data } = await supabase.auth.getUser();
			return data.user;
		} else {
			const user = JSON.parse(localStorage.getItem('token') || '{}').user;
			return user;
		}
	}

	public static async logout() {
		if (NODE_ENV != NodeEnv.SELF_HOSTED) {
			await supabase.auth.signOut();
		}
		localStorage.clear();
	}
}

export default AuthService;
