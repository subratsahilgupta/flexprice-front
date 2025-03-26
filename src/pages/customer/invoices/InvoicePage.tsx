import { Page, Spacer, Loader, ShortPagination } from '@/components/atoms';
import { InvoiceTable, ApiDocsContent } from '@/components/molecules';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import usePagination from '@/hooks/usePagination';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';

const InvoicesPage = () => {
	const { limit, offset, page } = usePagination();

	const fetchInvoices = async () => {
		return await InvoiceApi.getAllInvoices({
			limit,
			offset,
		});
	};

	const {
		data: invoiceData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchInvoices', page],
		queryFn: fetchInvoices,
	});

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching meters');
	}

	return (
		<Page heading='Invoices'>
			<ApiDocsContent tags={['Invoices']} />
			<div className='px-0'>
				<InvoiceTable data={invoiceData?.items || []} />
				<Spacer className='!h-4' />
				<ShortPagination unit='Invoices' totalItems={invoiceData?.pagination.total ?? 0} />
			</div>
		</Page>
	);
};

export default InvoicesPage;
