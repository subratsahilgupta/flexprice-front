import React, { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '../supbase/config';
import { useUser } from '@/hooks/UserContext';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/atoms/Spinner';

interface AuthMiddlewareProps {
    children: ReactNode;
    requiredRole: string[];
}

const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        throw error;
    }
    return data.user;
};

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children, requiredRole }) => {
    const userContext = useUser();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['fetchUser'],
        queryFn: fetchUser,
        retry: 1,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (user) {
            console.log(requiredRole);
            userContext.setUser(user);
        }
    }, [user, userContext]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
                <div className="flex flex-col items-center gap-2">
                    <Spinner size={50} className="text-primary" />
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return <Navigate to="/login" />;
    }

    // if (requiredRole && !requiredRole.includes(user.role)) {
    //     return <Navigate to="/not-authorized" />;
    // }

    return <>{children}</>;
};

export default AuthMiddleware;