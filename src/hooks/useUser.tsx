import { useQuery } from '@tanstack/react-query';
import { UserApi } from '@/utils/api_requests/UserApi';

const useUser = () => {
	const token = localStorage.getItem('sb-vnswkuldxqmqhyiewgsq-auth-token');
	const {
		data: user,
		isLoading: loading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['user', token],
		queryFn: async () => {
			return await UserApi.me();
		},
		// staleTime: 1000 * 60 * 5,
	});

	return { user, loading, error, refetch };
};

export default useUser;
