import { Page, SectionHeader, Spacer } from '@/components/atoms';
import { InvoiceTable, Pagination } from '@/components/molecules';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/atoms';
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
		return (
			<div className='fixed inset-0 flex items-center justify-center bg-white/80 z-50'>
				<div className='flex flex-col items-center gap-2'>
					<Spinner size={50} className='text-primary' />
					<p className='text-sm text-gray-500'>Loading...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		toast.error('Error fetching meters');
	}

	return (
		<Page className=''>
			<SectionHeader showFilter showSearch title='Invoices' />
			<div className='px-0'>
				<InvoiceTable data={invoiceData?.items || []} />
				<Spacer className='!h-4' />
				<Pagination totalPages={Math.ceil((invoiceData?.pagination.total ?? 1) / limit)} />
			</div>
		</Page>
	);
};

export default InvoicesPage;
