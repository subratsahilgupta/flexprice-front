import React, { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '../supbase/config';
import { useUser } from '@/hooks/UserContext';
import { useQuery } from '@tanstack/react-query';
import { PageLoader } from '@/components/atoms';

interface AuthMiddlewareProps {
	children: ReactNode;
	requiredRole: string[];
}
const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
	const userContext = useUser();
	const fetchUser = async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error) {
			throw error;
		}
		return data.user;
	};

	const {
		data: user,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchUser'],
		queryFn: fetchUser,
	});

	useEffect(() => {
		if (user) {
			userContext.setUser(user);
		}
	}, [user, userContext]);

	if (isLoading) {
		return <PageLoader />;
	}

	if (isError || !user) {
		return <Navigate to='/auth' />;
	}

	// if (requiredRole && !requiredRole.includes(user.role)) {
	//     return <Navigate to="/not-authorized" />;
	// }

	// Wrap children with AuthStateListener to handle auth state changes
	return <div>{children}</div>;
};

export default AuthMiddleware;
