import { useQuery } from '@tanstack/react-query';
import PaymentApi from '@/utils/api_requests/PaymentApi';
import usePagination from '@/hooks/usePagination';
import Page from '@/components/atoms/Page/Page';
import { Loader, ShortPagination } from '@/components/atoms';
import toast from 'react-hot-toast';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import { Payment } from '@/models/Payment';
import Chip from '@/components/atoms/Chip/Chip';
import { formatDateShort, getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
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
	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching payments');
	}

	return (
		<Page heading='Payments'>
			<div>
				<FlexpriceTable columns={columns} data={payments?.items ?? []} />
				<ShortPagination unit='Payments' totalItems={payments?.pagination.total ?? 0} />
			</div>
		</Page>
	);
};

export default PaymentPage;
