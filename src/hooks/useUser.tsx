import { useQuery } from '@tanstack/react-query';
import { UserApi } from '@/utils/api_requests/UserApi';
import AuthService from '@/core/auth/AuthService';

const useUser = () => {
	const tokenStr = AuthService.getAcessToken();

	const {
		data: user,
		isLoading: loading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['user', tokenStr],
		queryFn: async () => {
			return await UserApi.me();
		},
		enabled: !!tokenStr,
		// gcTime: 1000 * 60 * 5,
		// staleTime: 1000 * 60 * 5,
	});

	return { user, loading, error, refetch };
};

export default useUser;
