import { Button } from '@/components/atoms';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import CreateCustomerDrawer from './CreateCustomerDrawer';
import { Pencil } from 'lucide-react';

const fetchCustomer = async (customerId: string) => {
	return await CustomerApi.getCustomerById(customerId);
};

interface CustomerCardProps {
	customerId: string;
}

const CustomerOverviewCard: React.FC<CustomerCardProps> = ({ customerId }) => {
	const { data: customer, isLoading } = useQuery({
		queryKey: ['fetchCustomerDetails', customerId],
		queryFn: () => fetchCustomer(customerId),
		retry: 1,
		// staleTime: 1000 * 60 * 5, // 5 minutes
		staleTime: 0,
	});

	if (isLoading) {
		return (
			<div className='py-6 px-4 rounded-xl border border-gray-300'>
				<p className='text-gray-600'>Loading customer details...</p>
			</div>
		);
	}

	return (
		<div className='card border-gray-300'>
			<div className='flex justify-between items-center mb-4'>
				<h1 className='text-base font-bold mb-4 text-gray-800'>Customer Details</h1>
				<CreateCustomerDrawer
					trigger={
						<Button className='flex gap-2' variant={'outline'}>
							<Pencil /> Edit
						</Button>
					}
					data={customer}
				/>
			</div>
			<div className='flex flex-col  gap-4'>
				<div className='flex justify-between items-center'>
					<div className='text-sm font-light text-gray-600'>Name</div>
					<div className='text-sm font-normal text-gray-800'>{customer?.name || '--'}</div>
				</div>
				<div className='flex justify-between items-center'>
					<div className='text-sm font-light text-gray-600'>Email</div>
					<div className='text-sm font-normal text-gray-800'>{customer?.email || '--'}</div>
				</div>
				<div className='flex justify-between items-center'>
					<div className='text-sm font-light text-gray-600'>Slug</div>
					<div className='text-sm font-normal text-gray-800'>{customer?.external_id || '--'}</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerOverviewCard;
