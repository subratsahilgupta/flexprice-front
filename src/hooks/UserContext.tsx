import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '@/core/auth/AuthService';
import { logger } from '@/utils/common/Logger';

interface UserProviderProps {
	children: ReactNode;
}

interface UserContextProp {
	user: any;
	setUser: (user: any) => void;
}
const UserContext = createContext<UserContextProp>({} as UserContextProp);

export const UserProvider = ({ children }: UserProviderProps) => {
	const [user, setUser] = useState<any>({});

	useEffect(() => {
		try {
			const user = JSON.parse(localStorage.getItem('user')!);
			setUser(user);
		} catch (error) {
			logger.error(error);

			// logout user
			AuthService.logout();

			<Navigate to={'/auth'} />;
		}
	}, []);

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
