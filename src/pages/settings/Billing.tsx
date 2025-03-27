import { Card, CardHeader, Input, Loader, NoDataCard, Page } from '@/components/atoms';
import { ApiDocsContent } from '@/components/molecules';
import CustomerUsageTable from '@/components/molecules/CustomerUsageTable/CustomerUsageTable';
import SubscriptionTable from '@/components/organisms/Subscription/SubscriptionTable';
import useUser from '@/hooks/useUser';
import TenantApi from '@/utils/api_requests/TenantApi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
const BillingPage = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['billing'],
		queryFn: () => {
			return TenantApi.getTenantBillingDetails();
		},
	});

	const { user } = useUser();

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching billing details');
	}

	return (
		<Page heading='Billing'>
			<ApiDocsContent tags={['Billing']} />
			<div className='space-y-6'>
				{/* customer subscriptions table */}
				<Card variant='notched'>
					<CardHeader title='Subscriptions' />
					<SubscriptionTable data={data?.subscriptions ?? []} />
				</Card>

				{/* customer entitlements table */}
				<Card variant='notched'>
					<CardHeader title='Usage' />
					<CustomerUsageTable data={data?.usage.features ?? []} />
				</Card>

				{/* billing email */}
				<Card variant='notched'>
					<CardHeader title='Billing Email' />
					<div className='flex items-center gap-2 mt-6'>
						<Input value={user?.email} disabled />
					</div>
				</Card>

				{/* <Card variant='notched'>
					<CardHeader title='Invoices' />
					<div className='flex items-center gap-2 mt-6'>
						<Input value={user?.email} disabled />
					</div>
				</Card> */}
				<NoDataCard title='Invoices' subtitle='No invoices found' />
			</div>
		</Page>
	);
};

export default BillingPage;
