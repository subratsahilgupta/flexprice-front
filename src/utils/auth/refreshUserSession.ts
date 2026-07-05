import { UserApi } from '@/api/UserApi';
import { queryClient } from '@/core/services/tanstack/ReactQueryProvider';
import { USER_QUERY_KEY } from '@/hooks/useUser';
import type { User } from '@/models/User';
import { isIncomingUserTenantNewer, persistUserToLocalStorage, readUserFromLocalStorage } from './userStorage';

type TenantUpdate = User['tenant'];

interface TenantFormFallback {
	name: string;
	billing_details: TenantUpdate['billing_details'];
}

interface RefreshPersistedUserSessionOptions {
	user?: User;
}

export function mergeTenantUpdateIntoUser(currentUser: User, tenantUpdate: Partial<TenantUpdate>, formFallback?: TenantFormFallback): User {
	return {
		...currentUser,
		tenant: {
			...currentUser.tenant,
			...tenantUpdate,
			name: tenantUpdate.name ?? formFallback?.name ?? currentUser.tenant.name,
			billing_details: {
				...currentUser.tenant.billing_details,
				...tenantUpdate.billing_details,
				address: {
					...currentUser.tenant.billing_details?.address,
					...tenantUpdate.billing_details?.address,
					...(formFallback?.billing_details?.address ?? {}),
				},
			},
		},
	};
}

/** Writes user to React Query + localStorage when tenant.updated_at is not older than stored data. */
export async function refreshPersistedUserSession(
	setUser?: (user: User) => void,
	options?: RefreshPersistedUserSessionOptions,
): Promise<User> {
	const storedUser = readUserFromLocalStorage<User>();
	const incomingUser = options?.user ?? (await UserApi.me());

	if (storedUser && !isIncomingUserTenantNewer(incomingUser, storedUser)) {
		queryClient.setQueriesData<User>({ queryKey: [USER_QUERY_KEY] }, storedUser);
		setUser?.(storedUser);
		return storedUser;
	}

	queryClient.setQueriesData<User>({ queryKey: [USER_QUERY_KEY] }, incomingUser);

	if (persistUserToLocalStorage(incomingUser)) {
		setUser?.(incomingUser);
	}

	return incomingUser;
}
