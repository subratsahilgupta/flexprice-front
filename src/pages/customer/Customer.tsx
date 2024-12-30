import { Spinner } from '@/components/atoms';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const fetchCustomer = async () => {
	return await CustomerApi.getAllCustomers();
};

const CustomerPage = () => {
	const {
		data: customers,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchCustomer'],
		queryFn: fetchCustomer,
		retry: 2,
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading) {
		return (
			<div className='fixed inset-0 flex items-center justify-center bg-white/80 z-50'>
				<div className='flex flex-col items-center gap-2'>
					<Spinner size={50} className='text-primary' />
					<p className='text-sm text-gray-500'>Loading...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		toast.error('Error fetching meters');
	}

	return <div className='h-screen'></div>;
};

export default CustomerPage;
