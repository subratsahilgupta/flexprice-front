import { useParams } from 'react-router-dom';
import InvoiceDetails from '../customers/invoice/InvoiceDetail';
import { useQuery } from '@tanstack/react-query';
import usePagination from '@/hooks/usePagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentApi from '@/utils/api_requests/PaymentApi';
import { Loader, ShortPagination } from '@/components/atoms';
import { InvoicePaymentsTable } from '@/components/molecules';

const InvoiceDetailsPage = () => {
	const { invoiceId } = useParams();

	const { limit, offset } = usePagination();

	const { data: payments, isLoading } = useQuery({
		queryKey: ['payments', invoiceId],
		queryFn: () =>
			PaymentApi.getAllPayments({
				limit,
				offset,
				destination_id: invoiceId!,
				destination_type: 'INVOICE',
			}),
	});

	return (
		<div>
			<Tabs defaultValue='preview' className='w-full'>
				<div className='px-4'>
					<TabsList>
						<TabsTrigger className='text-sm font-normal' value='preview'>
							Preview
						</TabsTrigger>
						<TabsTrigger className='text-sm font-normal' value='payments'>
							Payments
						</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value='preview'>
					<InvoiceDetails breadcrumb_index={2} invoice_id={invoiceId!} />
				</TabsContent>
				<TabsContent value='payments'>
					{isLoading ? (
						<Loader />
					) : (
						<div>
							<InvoicePaymentsTable data={payments?.items ?? []} />
							<ShortPagination unit='Payments' totalItems={payments?.pagination.total ?? 0} />
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default InvoiceDetailsPage;
