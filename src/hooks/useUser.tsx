import { useQuery } from '@tanstack/react-query';
import { UserApi } from '@/utils/api_requests/UserApi';

const useUser = () => {
	const {
		data: user,
		isLoading: loading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['user'],
		queryFn: async () => {
			return await UserApi.me();
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		retry: 1,
	});

	return { user, loading, error, refetch };
};

export default useUser;
