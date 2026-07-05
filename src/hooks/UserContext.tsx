import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { persistUserToLocalStorage, readUserFromLocalStorage } from '@/utils/auth/userStorage';

interface UserProviderProps {
	children: ReactNode;
}

interface UserContextProp {
	user: any;
	setUser: (user: any) => void;
}
const UserContext = createContext<UserContextProp>({} as UserContextProp);

export const UserProvider = ({ children }: UserProviderProps) => {
	const [user, setUserState] = useState<any>(null);

	const setUser = useCallback((next: any) => {
		if (next == null) {
			setUserState(null);
			persistUserToLocalStorage(null);
			return;
		}

		// React state always reflects the caller's intent; persistence to localStorage is a
		// best-effort side effect gated by the freshness guard and never blocks the state update.
		setUserState(next);
		persistUserToLocalStorage(next);
	}, []);

	useEffect(() => {
		setUserState(readUserFromLocalStorage());
	}, []);

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
