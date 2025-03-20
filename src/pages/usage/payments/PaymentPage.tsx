import { useQuery } from '@tanstack/react-query';
import PaymentApi from '@/utils/api_requests/PaymentApi';
import usePagination from '@/hooks/usePagination';
import { Loader, ShortPagination } from '@/components/atoms';
import toast from 'react-hot-toast';
import { ApiDocsContent, ColumnData, FlexpriceTable } from '@/components/molecules';
import { Payment } from '@/models/Payment';
import { Chip, Page } from '@/components/atoms';
import { formatDateShort, getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
import { CodeSnippet } from '@/store/useApiDocsStore';
const columns: ColumnData<Payment>[] = [
	{
		title: 'ID',
		fieldName: 'idempotency_key',
		fieldVariant: 'title',
	},
	{
		title: 'Date',
		render: (payment) => formatDateShort(payment.created_at),
	},
	{
		title: 'Status',
		render: (payment) => (
			<Chip
				label={toSentenceCase(payment.payment_status)}
				variant={payment.payment_status.toLowerCase() === 'succeeded' ? 'success' : 'failed'}
			/>
		),
	},
	{
		title: 'Amount',
		render: (payment) => `${getCurrencySymbol(payment.currency)} ${payment.amount}`,
	},
];

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
				<FlexpriceTable columns={columns} data={payments?.items ?? []} />
				<ShortPagination unit='Payments' totalItems={payments?.pagination.total ?? 0} />
			</div>
		</Page>
	);
};

export default PaymentPage;
