import { useQuery } from '@tanstack/react-query';
import { UserApi } from '@/api/UserApi';
import AuthService from '@/core/auth/AuthService';

export const USER_QUERY_KEY = 'user' as const;

export const getUserQueryKey = (token?: unknown) => [USER_QUERY_KEY, token] as const;

const useUser = () => {
	const tokenStr = AuthService.getAcessToken();

	const {
		data: user,
		isLoading: loading,
		error,
		refetch,
	} = useQuery({
		queryKey: getUserQueryKey(tokenStr),
		queryFn: async () => {
			return await UserApi.me();
		},
		enabled: !!tokenStr,
		retry: 4,
		retryDelay: 1000,
	});

	return { user, loading, error, refetch };
};

export default useUser;
