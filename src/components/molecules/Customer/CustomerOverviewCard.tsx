import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';

const fetchCustomer = async (customerId: string) => {
	return await CustomerApi.getCustomerById(customerId);
};

interface CustomerCardProps {
	customerId: string;
}

const CustomerOverviewCard: React.FC<CustomerCardProps> = ({ customerId }) => {
	const { data: customer, isLoading } = useQuery({
		queryKey: ['fetchCustomerCard', customerId], // Add customerId to the key for caching
		queryFn: () => fetchCustomer(customerId),
		retry: 1,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	if (isLoading) {
		return (
			<div className='py-6 px-4 rounded-xl border border-gray-300'>
				<p className='text-gray-600'>Loading customer details...</p>
			</div>
		);
	}

	return (
		<div className='py-6 px-4 rounded-xl border border-gray-300'>
			<h1 className='text-base font-bold mb-4 text-gray-800'>Customer Details</h1>
			<div className='grid grid-cols-2 gap-4'>
				<div className='text-sm font-light text-gray-600'>Name</div>
				<div className='text-sm font-normal text-gray-800'>{customer?.name || '--'}</div>

				<div className='text-sm font-light text-gray-600'>Email</div>
				<div className='text-sm font-normal text-gray-800'>{customer?.email || '--'}</div>

				<div className='text-sm font-light text-gray-600'>Slug</div>
				<div className='text-sm font-normal text-gray-800'>{customer?.external_id || '--'}</div>
			</div>
		</div>
	);
};

export default CustomerOverviewCard;
