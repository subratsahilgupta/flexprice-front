import { UserApi } from '@/api/UserApi';
import { queryClient } from '@/core/services/tanstack/ReactQueryProvider';
import { USER_QUERY_KEY } from '@/hooks/useUser';
import type { User } from '@/models/User';
import { isIncomingUserTenantNewer, persistUserToLocalStorage, readUserFromLocalStorage } from './userStorage';

interface RefreshPersistedUserSessionOptions {
	user?: User;
}

/**
 * Reconciles a freshly-fetched/updated user with whatever is already persisted, then writes the
 * winner to React Query + localStorage + the caller's React state — the single place that
 * decides which copy wins, so callers (AuthProvider, UpdateTenantDrawer, login) don't each
 * reimplement the freshness check themselves.
 */
export async function refreshPersistedUserSession(
	setUser?: (user: User) => void,
	options?: RefreshPersistedUserSessionOptions,
): Promise<User> {
	const storedUser = readUserFromLocalStorage<User>();
	const incomingUser = options?.user ?? (await UserApi.me());
	const resolvedUser = storedUser && !isIncomingUserTenantNewer(incomingUser, storedUser) ? storedUser : incomingUser;

	if (resolvedUser === incomingUser) {
		persistUserToLocalStorage(incomingUser);
	}

	queryClient.setQueriesData<User>({ queryKey: [USER_QUERY_KEY] }, resolvedUser);
	setUser?.(resolvedUser);

	return resolvedUser;
}
