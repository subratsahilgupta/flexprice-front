import { Button } from '@/components/atoms';
import supabase from '@/core/supbase/config';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CustomerPage() {
  const navigate = useNavigate();
  
  const signout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Logged out successfully');
      navigate('/login');
      return true; // Return a value to satisfy React Query
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
      throw error; // Re-throw the error for React Query error handling
    }
  }

  const { isLoading: isSignoutLoading, refetch } = useQuery({
    queryKey: ['logout'],
    queryFn: signout,
    enabled: false 
  });

  return (
    <div className="p-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => refetch()} 
          loading={isSignoutLoading}
          variant="outline"
        >
          Logout
        </Button>
      </div>
      <div>CustomerPage</div>
    </div>
  );
}