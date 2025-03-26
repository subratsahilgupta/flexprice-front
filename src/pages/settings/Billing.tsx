import { Loader, Page } from '@/components/atoms';
import { ApiDocsContent } from '@/components/molecules';
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

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching billing details');
	}

	if (data) {
		console.log(data);
	}
	return (
		<Page heading='Billing'>
			<ApiDocsContent tags={['Billing']} />
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</Page>
	);
};

export default BillingPage;
