import { Button, SectionHeader, Spacer, Spinner } from '@/components/atoms';
import { CreateCustomerDrawer, Pagination } from '@/components/molecules';
import CustomerTable from '@/components/molecules/Customer/CustomerTable';
import usePagination from '@/hooks/usePagination';
import Customer from '@/models/Customer';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiFolderPlus } from 'react-icons/fi';
import { IoSearch } from 'react-icons/io5';

const CustomerPage = () => {
	const { limit, offset, page } = usePagination();

	const fetchCustomers = async () => {
		return await CustomerApi.getAllCustomers({ limit, offset });
	};

	const [activeCustomer, setactiveCustomer] = useState<Customer>();
	const [customerDrawerOpen, setcustomerDrawerOpen] = useState(false);

	const {
		data: customerData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchCustomers', page],
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
		<div className='page'>
			<SectionHeader showFilter showSearch title='Customers'>
				<CreateCustomerDrawer
					trigger={
						<Button
							onClick={() => {
								setactiveCustomer(undefined);
								console.log('clicked');
							}}
							className='flex gap-2 bg-[#0F172A]'>
							<FiFolderPlus />
							<span>Add Customer</span>
						</Button>
					}
					open={customerDrawerOpen}
					onOpenChange={setcustomerDrawerOpen}
					data={activeCustomer}
				/>
			</SectionHeader>
			<div>
				<CustomerTable
					onEdit={(data) => {
						console.log('data', data);
						setactiveCustomer(data);
						setcustomerDrawerOpen(true);
					}}
					data={customerData?.items || []}
				/>
				<Spacer className='!h-4' />
				<Pagination totalPages={Math.ceil((customerData?.pagination.total ?? 1) / limit)} />
			</div>
		</div>
	);
};

export default CustomerPage;
