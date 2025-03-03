import { Page, Spacer, Loader } from '@/components/atoms';
import { InvoiceTable, Pagination } from '@/components/molecules';
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
			<div className='px-0'>
				<InvoiceTable data={invoiceData?.items || []} />
				<Spacer className='!h-4' />
				<Pagination totalPages={Math.ceil((invoiceData?.pagination.total ?? 1) / limit)} />
			</div>
		</Page>
	);
};

export default InvoicesPage;
