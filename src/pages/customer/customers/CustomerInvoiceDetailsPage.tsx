import { useParams } from 'react-router-dom';
import InvoiceDetails from '../customers/invoice/InvoiceDetail';
import { useQuery } from '@tanstack/react-query';
import PaymentApi from '@/utils/api_requests/PaymentApi';
import { CustomTabs } from '@/components/atoms/CustomTabs';
import { Loader, Page, ShortPagination } from '@/components/atoms';
import { InvoicePaymentsTable } from '@/components/molecules';
import usePagination from '@/hooks/usePagination';

const CustomerInvoiceDetailsPage = () => {
	const { invoice_id } = useParams();
	const { limit, offset } = usePagination();
	const { data: payments, isLoading } = useQuery({
		queryKey: ['payments', invoice_id],
		queryFn: () =>
			PaymentApi.getAllPayments({
				limit,
				offset,
				destination_id: invoice_id!,
				destination_type: 'INVOICE',
			}),
	});

	const tabs = [
		{
			value: 'Overview',
			label: 'Overview',
			content: <InvoiceDetails breadcrumb_index={4} invoice_id={invoice_id!} />,
		},
		{
			value: 'payments',
			label: 'Payments',
			content: isLoading ? (
				<Loader />
			) : (
				<div>
					<InvoicePaymentsTable data={payments?.items ?? []} />
					<ShortPagination unit='Payments' totalItems={payments?.pagination.total ?? 0} />
				</div>
			),
		},
	];

	return (
		<Page>
			<CustomTabs tabs={tabs} defaultValue='Overview' />
		</Page>
	);
};

export default CustomerInvoiceDetailsPage;
