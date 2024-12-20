import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../supbase/config';

interface AuthContextType {
  user: any;
  roles: string[] | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Define public and private routes
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];
const ROLE_BASED_ROUTES: Record<string, string[]> = {
  admin: ['/admin', '/plans', '/metering', '/query', '/customer'],
  user: ['/plans', '/customer'],
  // Add more role-based routes as needed
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAccess = (userRoles: string[] | null, path: string) => {
    if (!userRoles || userRoles.length === 0) return false;
    return userRoles.some(role => ROLE_BASED_ROUTES[role]?.some(route => path.startsWith(route)));
  };

  const handleNavigation = (user: any, userRoles: string[] | null) => {
    const currentPath = location.pathname;
    
    if (!user) {
      // If not logged in and trying to access private route, redirect to login
      if (!PUBLIC_ROUTES.includes(currentPath)) {
        navigate('/login', { replace: true });
      }
      return;
    }

    // User is logged in but on public route, redirect to default page
    if (PUBLIC_ROUTES.includes(currentPath)) {
      navigate('/', { replace: true });
      return;
    }

    // Check if user has access to current route
    if (!checkAccess(userRoles, currentPath)) {
      // Redirect to first allowed route or fallback to home
      const firstAllowedRoute = userRoles?.length 
        ? ROLE_BASED_ROUTES[userRoles[0]]?.[0] 
        : '/';
      navigate(firstAllowedRoute || '/', { replace: true });
    }
  };

  useEffect(() => {
    const fetchUserAndRoles = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error fetching roles:', error);
          setRoles(null);
        } else {
          const userRoles = roleData.map((item: { role: string }) => item.role);
          setRoles(userRoles);
          handleNavigation(session.user, userRoles);
        }
      } else {
        setRoles(null);
        handleNavigation(null, null);
      }
      setIsLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserAndRoles();
      } else {
        setRoles(null);
        handleNavigation(null, null);
      }
    });

    fetchUserAndRoles();

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [location.pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRoles(null);
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={{ user, roles, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
