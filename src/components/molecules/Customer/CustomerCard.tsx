import { SubscriptionUsage } from '@/models/Subscription';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import formatDate from '@/utils/common/format_date';
import { useQuery } from '@tanstack/react-query';

const fetchCustomer = async (customerId: string) => {
	return await CustomerApi.getCustomerById(customerId);
};

interface CustomerCardProps {
	customerId: string;
	subscriptionData?: SubscriptionUsage | null;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customerId, subscriptionData }) => {
	const { data: customer, isLoading } = useQuery({
		queryKey: ['fetchCustomerCard', customerId],
		queryFn: () => fetchCustomer(customerId),
		retry: 1,
		staleTime: 1000 * 60 * 5,
	});

	// Loading Skeleton
	if (isLoading) {
		return (
			<div className='flex items-center justify-center'>
				<div className='py-6 px-4 rounded-xl border border-gray-300'>
					<div className='h-6 w-32 bg-gray-200 rounded animate-pulse mb-4'></div>
					<div className='flex items-start space-x-3'>
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

	// Customer Details
	return (
		<div className='items-center justify-center'>
			<div className='py-6 px-4 rounded-xl border border-gray-300 bg-white'>
				<h1 className='text-base font-bold mb-4 text-gray-800'>Customer Details</h1>
				<div className='flex items-center space-x-4'>
					<div className='w-12 h-12'>
						<img src={'https://picsum.photos/200/300'} alt='Customer Profile' className='w-full h-full rounded-full object-cover shadow' />
					</div>
					<div className='flex flex-col space-y-1'>
						<div className='text-base font-semibold text-gray-800'>{customer?.name}</div>
						<div className='text-sm font-normal text-gray-600'>{customer?.email}</div>
						{subscriptionData && (
							<div className='mt-2 space-y-1'>
								<div className='text-sm font-normal text-gray-600'>
									<strong>Subscription Amount:</strong> {subscriptionData.display_amount}
								</div>
								<div className='text-sm font-normal text-gray-600'>
									<strong>Subscription Start Date:</strong> {formatDate(subscriptionData.start_time.toString())}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerCard;
