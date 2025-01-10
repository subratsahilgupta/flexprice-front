import { SectionHeader, Spacer, Spinner } from '@/components/atoms';
import { CreateCustomerDrawer, Pagination } from '@/components/molecules';
import CustomerTable from '@/components/molecules/Customer/CustomerTable';
import usePagination from '@/hooks/usePagination';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { IoSearch } from 'react-icons/io5';
import { LiaSlidersHSolid } from 'react-icons/lia';

const CustomerPage = () => {
	const { limit, offset, page } = usePagination();

	const fetchCustomers = async () => {
		return await CustomerApi.getAllCustomers({ limit, offset });
	};

	const {
		data: customers,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchCustomer', page],
		queryFn: fetchCustomers,
		retry: 2,
		staleTime: 0,
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
		toast.error('Error fetching customers');
		return null;
	}

	return (
		<div className='flex flex-col h-screen'>
			<SectionHeader title='Customers'>
				<div className='flex gap-2 w-full'>
					<button className='px-2 py-1'>
						<IoSearch className='size-5 text-[#09090B]' />
					</button>
					<button className='px-2 py-1'>
						<LiaSlidersHSolid className='size-5 text-[#09090B]' />
					</button>
					<CreateCustomerDrawer />
				</div>
			</SectionHeader>
			<div>
				<CustomerTable data={customers?.customers || []} />
				<Spacer className='!h-4' />
				<Pagination totalPages={Math.ceil((customers?.total ?? 1) / limit)} />
			</div>
		</div>
	);
};

export default CustomerPage;
