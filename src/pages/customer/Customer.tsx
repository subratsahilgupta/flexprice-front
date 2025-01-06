import { SectionHeader, Spinner } from '@/components/atoms';
import { CreateCustomerDrawer } from '@/components/molecules';
import CustomerTable from '@/components/molecules/Customer/CustomerTable';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { IoSearch } from 'react-icons/io5';
import { LiaSlidersHSolid } from 'react-icons/lia';

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

	return (
		<div className='flex flex-col h-screen'>
			<SectionHeader title='Customers'>
				<div className='flex gap-2 w-full'>
					<button className='px-2 py-1'>
						<IoSearch className='size-5 text-[#09090B] ' />
					</button>
					<button className='px-2 py-1'>
						<LiaSlidersHSolid className='size-5 text-[#09090B] ' />
					</button>
					<CreateCustomerDrawer />
				</div>
			</SectionHeader>
			<div className=''>
				<CustomerTable data={customers?.customers || []} />
			</div>
		</div>
	);
};

export default CustomerPage;
