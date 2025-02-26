import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '@/core/supbase/config';

interface UserProviderProps {
	children: ReactNode;
}
interface UserContextProp {
	user: any;
	setUser: (user: any) => void;
}
const UserContext = createContext<UserContextProp>({} as UserContextProp);

export const UserProvider = ({ children }: UserProviderProps) => {
	const [user, setUser] = useState<any>({} as any);

	useEffect(() => {
		try {
			const user = JSON.parse(localStorage.getItem('user')!) as any;
			setUser(user);
		} catch (error) {
			supabase.auth.signOut();
			<Navigate to={'/auth'} />;
		}
	}, []);

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
