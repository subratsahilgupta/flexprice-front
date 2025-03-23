import { useQuery } from '@tanstack/react-query';
import PaymentApi from '@/utils/api_requests/PaymentApi';
import usePagination from '@/hooks/usePagination';
import { Loader, ShortPagination } from '@/components/atoms';
import toast from 'react-hot-toast';
import { ApiDocsContent, InvoicePaymentsTable } from '@/components/molecules';
import { Page } from '@/components/atoms';
import { CodeSnippet } from '@/store/useApiDocsStore';

const PaymentPage = () => {
	const { limit, offset } = usePagination();

	const {
		data: payments,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['payments'],
		queryFn: () => PaymentApi.getAllPayments({ limit, offset }),
	});

	const snippets: CodeSnippet[] = [
		{
			label: 'List all payments',
			curl: `curl --request GET \\
--url https://api.cloud.flexprice.io/v1/payments \\
--header 'x-api-key: <api-key>'`,
		},
		{
			label: 'Create a payment',
			curl: `curl --request POST \\
--url https://api.cloud.flexprice.io/v1/payments \\
--header 'x-api-key: <api-key>' \\
--header 'content-type: application/json' \\
--data '{
"amount": 1000,
"currency": "USD",
"customer_id": "cust_123"
}'`,
		},
		{
			label: 'Get payment details',
			curl: `curl --request GET \\
--url https://api.cloud.flexprice.io/v1/payments/pay_123 \\
--header 'x-api-key: <api-key>'`,
		},
	];

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching payments');
	}

	return (
		<Page heading='Payments'>
			<ApiDocsContent docsUrl='/docs/payments' snippets={snippets} />
			<div>
				<InvoicePaymentsTable data={payments?.items ?? []} />
				<ShortPagination unit='Payments' totalItems={payments?.pagination.total ?? 0} />
			</div>
		</Page>
	);
};

export default PaymentPage;
