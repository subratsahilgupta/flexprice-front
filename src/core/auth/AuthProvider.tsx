import React, { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router';
import { useUser } from '@/hooks/UserContext';
import { PageLoader } from '@/components/atoms';
import useUserhook, { USER_QUERY_KEY } from '@/hooks/useUser';
import { queryClient } from '@/core/services/tanstack/ReactQueryProvider';
import { isIncomingUserTenantNewer, readUserFromLocalStorage } from '@/utils/auth/userStorage';
import type { User } from '@/models/User';

interface AuthMiddlewareProps {
	children: ReactNode;
	requiredRole: string[];
}
const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
	const userContext = useUser();
	const { user, loading, error } = useUserhook();

	useEffect(() => {
		if (!user) return;

		const storedUser = readUserFromLocalStorage<User>();
		const shouldUseStored = Boolean(storedUser && !isIncomingUserTenantNewer(user, storedUser));
		const userToSync = shouldUseStored ? storedUser! : user;

		if (shouldUseStored) {
			queryClient.setQueriesData<User>({ queryKey: [USER_QUERY_KEY] }, storedUser!);
		}

		const currentUpdatedAt = userContext.user?.tenant?.updated_at;
		if (currentUpdatedAt === userToSync.tenant?.updated_at && userContext.user?.tenant?.name === userToSync.tenant?.name) {
			return;
		}

		userContext.setUser(userToSync);
	}, [user, userContext]);

	if (loading) {
		return <PageLoader />;
	}

	if (error || !user) {
		return <Navigate to='/auth' />;
	}

	// if (requiredRole && !requiredRole.includes(user.role)) {
	//     return <Navigate to="/not-authorized" />;
	// }

	// Wrap children with AuthStateListener to handle auth state changes
	return <div>{children}</div>;
};

export default AuthMiddleware;
