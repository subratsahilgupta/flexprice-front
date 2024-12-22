import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../core/supbase/config';
import { useUser } from '@/hooks/UserContext';
import { UserService } from '@/utils/api_requests/UserApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from "@/components/atoms";
import toast, { Toaster } from 'react-hot-toast';

const AuthPage: React.FC = () => {
    const userContext = useUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate(); // React Router's navigation hook

    const { data: userData, isLoading, isError, refetch } = useQuery({
        queryKey: ['fetchUser'],
        queryFn: () => UserService.me(),
        enabled: false,
    });

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                userContext.setUser(session?.user || null);
                navigate('/'); 
            } else if (event === 'SIGNED_OUT') {
                userContext.setUser(null);
                queryClient.invalidateQueries({ queryKey: ['fetchUser'] });
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [refetch, userContext, queryClient, navigate]);

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast.error(error.message);
        } else {
            refetch();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <Toaster/>
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                    Login to Your Account
                </h2>
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" loading={isLoading}>
                        Login
                    </Button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a href="/signup" className="text-blue-500 hover:underline">
                        Sign up here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
