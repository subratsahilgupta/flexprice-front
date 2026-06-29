import { useQuery, useMutation } from '@tanstack/react-query';
import { UserApi } from '@/api/UserApi';
import { refetchQueries } from '@/core/services/tanstack/ReactQueryProvider';
import { SETTINGS_MEMBERS_PAGE_SIZE } from '../constants';
import { settingsQueryKeys } from '../queryKeys';

export function useTenantMembers() {
	const query = useQuery({
		queryKey: settingsQueryKeys.teamMembersRoot(),
		queryFn: () =>
			UserApi.getTenantMembers({
				limit: 1000,
				offset: 0,
				includeAllStatuses: true,
			}),
	});

	const createUser = useMutation({
		mutationFn: (payload: { type: 'user'; email: string }) => UserApi.addUserToTenant(payload),
		onSuccess: () => {
			refetchQueries([...settingsQueryKeys.teamMembersRoot()]);
		},
	});

	return {
		...query,
		members: query.data?.items ?? [],
		totalMembers: query.data?.pagination?.total ?? query.data?.items?.length ?? 0,
		pageSize: SETTINGS_MEMBERS_PAGE_SIZE,
		createUser,
	};
}
