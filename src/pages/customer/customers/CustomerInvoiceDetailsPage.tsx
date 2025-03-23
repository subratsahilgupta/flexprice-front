import { useParams } from 'react-router-dom';
import InvoiceDetails from '../customers/invoice/InvoiceDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import PaymentApi from '@/utils/api_requests/PaymentApi';
import { Loader, ShortPagination } from '@/components/atoms';
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
					<InvoiceDetails breadcrumb_index={4} invoice_id={invoice_id!} />
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

export default CustomerInvoiceDetailsPage;
