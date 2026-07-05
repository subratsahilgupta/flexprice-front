import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
	clearUserFromLocalStorage,
	isIncomingUserTenantNewer,
	persistUserToLocalStorage,
	readUserFromLocalStorage,
} from '@/utils/auth/userStorage';

interface UserProviderProps {
	children: ReactNode;
}

interface UserContextProp {
	user: any;
	setUser: (user: any) => void;
}
const UserContext = createContext<UserContextProp>({} as UserContextProp);

export { clearUserFromLocalStorage, isIncomingUserTenantNewer, persistUserToLocalStorage, readUserFromLocalStorage };

export const UserProvider = ({ children }: UserProviderProps) => {
	const [user, setUserState] = useState<any>({});

	const setUser = useCallback((next: any) => {
		if (next == null) {
			setUserState(null);
			persistUserToLocalStorage(null);
			return;
		}

		if (persistUserToLocalStorage(next)) {
			setUserState(next);
		}
	}, []);

	useEffect(() => {
		const parsed = readUserFromLocalStorage();
		if (parsed) {
			setUserState(parsed);
		}
	}, []);

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
