import { useNavigate, useParams } from 'react-router-dom';
import { AddButton, Card, CardHeader } from '@/components/atoms';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import SubscriptionTable from '@/components/organisms/Subscription/SubscriptionTable';
import { Subscription } from '@/models/Subscription';
import Loader from '@/components/atoms/Loader';
import toast from 'react-hot-toast';
import CustomerUsageTable from '@/components/molecules/CustomerUsageTable/CustomerUsageTable';

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
		queryKey: ['subscriptions', customerId],
		queryFn: () => fetchAllSubscriptions(customerId!),
	});

	const {
		data: usageData,
		isLoading: usageLoading,
		error: usageError,
	} = useQuery({
		queryKey: ['usage', customerId],
		queryFn: () => CustomerApi.getUsageSummary({ customer_id: customerId! }),
	});
	if (subscriptionsLoading || usageLoading) {
		return <Loader />;
	}

	if (subscriptionsError || usageError) {
		toast.error('Something went wrong');
	}

	return (
		<div className='space-y-6'>
			<Card variant='notched'>
				<CardHeader title='Subscriptions' cta={<AddButton onClick={handleAddSubscription} />} />
				{(subscriptions?.length || 0) > 0 ? (
					<SubscriptionTable
						onRowClick={(row) => {
							navigate(`/customer-management/customers/${customerId}/subscription/${row.id}`);
						}}
						data={subscriptions as Subscription[]}
						customerId={customerId!}
					/>
				) : (
					<p className='text-gray-500 text-sm'>No Active Subscriptions Yet</p>
				)}
			</Card>

			{/* customer entitlements table */}
			<Card variant='notched'>
				<CardHeader title='Entitlements' />
				<CustomerUsageTable data={usageData?.features ?? []} />
			</Card>
		</div>
	);
};

export default Overview;
