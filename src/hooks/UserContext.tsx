import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { isIncomingUserTenantNewer, persistUserToLocalStorage, readUserFromLocalStorage } from '@/utils/auth/userStorage';

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

		// The freshness guard only arbitrates what gets *persisted*; the caller's intent is
		// always reflected in React state, even when a fresher copy already exists in storage.
		const stored = readUserFromLocalStorage();
		const resolved = stored && !isIncomingUserTenantNewer(next, stored) ? stored : next;
		setUserState(resolved);
		if (resolved === next) {
			persistUserToLocalStorage(next);
		}
	}, []);

	useEffect(() => {
		setUserState(readUserFromLocalStorage());
	}, []);

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
