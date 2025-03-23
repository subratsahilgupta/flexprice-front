import { useNavigate, useParams } from 'react-router-dom';
import { AddButton, Card, CardHeader } from '@/components/atoms';
import CustomerApi from '@/utils/api_requests/CustomerApi';
import { useQuery } from '@tanstack/react-query';
import SubscriptionTable from '@/components/organisms/Subscription/SubscriptionTable';
import { Subscription } from '@/models/Subscription';
import Loader from '@/components/atoms/Loader';
import toast from 'react-hot-toast';
import CustomerEntitlementTable from '@/components/molecules/CustomerEntitlementTable/CustomerEntitlementTable';

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
		data: entitlementsData,
		isLoading: entitlementsLoading,
		error: entitlementsError,
	} = useQuery({
		queryKey: ['entitlements', customerId],
		queryFn: () => CustomerApi.getEntitlements({ customer_id: customerId! }),
	});
	if (subscriptionsLoading || entitlementsLoading) {
		return <Loader />;
	}

	if (subscriptionsError || entitlementsError) {
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
				<CustomerEntitlementTable data={entitlementsData?.features ?? []} />
			</Card>
		</div>
	);
};

export default Overview;
