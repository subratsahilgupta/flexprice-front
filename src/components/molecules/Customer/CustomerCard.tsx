import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';

const fetchCustomer = async (customerId: string) => {
	return await CustomerApi.getCustomerById(customerId);
};

interface CustomerCardProps {
	customerId: string;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customerId }) => {
	const { data: customer, isLoading } = useQuery({
		queryKey: ['fetchCustomerCard'],
		queryFn: () => fetchCustomer(customerId!),
		retry: 1,
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading) {
		return (
			<div className='items-center justify-center'>
				<div className='py-6 px-4 rounded-xl border border-gray-300'>
					<div className='h-6 w-32 bg-gray-200 rounded animate-pulse mb-2'></div>
					<div className='flex place-items-start space-x-3'>
						<div className='w-10 h-10 bg-gray-200 rounded-full animate-pulse'></div>
						<div className='flex flex-col space-y-2 flex-1'>
							<div className='h-5 w-32 bg-gray-200 rounded animate-pulse'></div>
							<div className='h-4 w-48 bg-gray-200 rounded animate-pulse'></div>
							<div className='h-4 w-24 bg-gray-200 rounded animate-pulse'></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='items-center justify-center'>
			<div className='py-6 px-4 rounded-xl border border-gray-300'>
				<h1 className='text-base font-bold mb-2 text-gray-800'>Customer Details</h1>
				<div className='flex place-items-start space-x-3'>
					<div className='w-10 h-10'>
						<img
							src={'https://picsum.photos/200/300'}
							alt='Customer Profile'
							className='w-full h-full rounded-full object-cover shadow-md'
						/>
					</div>
					<div className='flex flex-col'>
						<div className='text-base font-semibold text-gray-800'>{customer?.name}</div>
						<div className='text-sm font-normal text-gray-600'>{customer?.email}</div>
						<div className='text-sm font-normal text-gray-600'>{customer?.status}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerCard;
