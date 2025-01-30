import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/atoms';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import SubscriptionTable from '@/components/organisms/Subscription/SubscriptionTable';
import { Subscription } from '@/models/Subscription';
import CustomerOverviewCard from '@/components/molecules/Customer/CustomerOverviewCard';
import { FiFolderPlus } from 'react-icons/fi';

const SkeletonLoader = () => (
	<div className='rounded-xl border border-gray-300 p-6 space-y-4'>
		<div className='space-y-3'>
			<div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse'></div>
			<div className='h-4 bg-gray-200 rounded w-1/2 animate-pulse'></div>
			<div className='h-4 bg-gray-200 rounded w-5/6 animate-pulse'></div>
		</div>
		<div className='space-y-3'>
			<div className='h-4 bg-gray-200 rounded w-2/3 animate-pulse'></div>
			<div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse'></div>
			<div className='h-4 bg-gray-200 rounded w-1/2 animate-pulse'></div>
		</div>
	</div>
);

const fetchAllSubscriptions = async (customerId: string) => {
	const subs = await CustomerApi.getCustomerSubscriptions(customerId);
	return subs.items;
};
const Overview = () => {
	const navigate = useNavigate();
	const { id: customerId } = useParams();

	const handleAddSubscription = () => {
		navigate(`/customer-management/customers/${customerId}/add-subscription`);
	};

	const {
		data: subscriptions,
		isLoading: subscriptionsLoading,
		error: subscriptionsError,
	} = useQuery({
		queryKey: ['subscriptions', customerId], // Unique key for caching
		queryFn: () => fetchAllSubscriptions(customerId!),
		retry: 1,
		staleTime: 0,
		refetchOnWindowFocus: true,
		refetchOnMount: 'always', // Refetch when the component is remounted
	});

	return (
		<div className='space-y-4 w-2/3'>
			<CustomerOverviewCard customerId={customerId!} />
			<div className='space p-6 rounded-xl border border-gray-300'>
				<div className='flex mb-4 justify-between items-center'>
					<h2 className='text-base font-semibold text-gray-800'>Subscriptions</h2>
					<Button
						onClick={handleAddSubscription}
						className='bg-primary text-white px-4 inline-flex items-center py-2 rounded-md hover:bg-primary-dark'>
						<FiFolderPlus />
						Add Subscription
					</Button>
				</div>

				{subscriptionsLoading ? (
					<SkeletonLoader />
				) : subscriptionsError ? (
					<p className='text-red-500 text-sm'>Error loading subscriptions</p>
				) : (subscriptions ?? []).length === 0 ? (
					<p className='text-gray-500 text-sm'>No Active Subscriptions Yet</p>
				) : (
					<SubscriptionTable
						onRowClick={(row) => {
							console.log('clicked on row', row);
							navigate(`/customer-management/customers/${customerId}/subscription/${row.id}`);
						}}
						data={subscriptions as Subscription[]}
						customerId={customerId!}
					/>
				)}
			</div>
		</div>
	);
};

export default Overview;
