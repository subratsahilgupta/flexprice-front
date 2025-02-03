import { SectionHeader, Spacer } from '@/components/atoms';
import { IoSearch } from 'react-icons/io5';
import { InvoiceTable, Pagination } from '@/components/molecules';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/atoms';
import toast from 'react-hot-toast';
import { ReactSVG } from 'react-svg';
import usePagination from '@/hooks/usePagination';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import { SlidersHorizontal } from 'lucide-react';

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
		retry: 2,
		staleTime: 0,
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

	if (invoiceData?.items.length === 0) {
		return (
			<div className='h-screen w-full flex justify-center items-center'>
				<div className='w-full flex flex-col items-center '>
					<ReactSVG src={'/assets/svg/empty box.svg'} />
					<p className='font-sans text-2xl font-bold'>Add your first billable metric</p>
					<p className='text-[#71717A] font-normal '>
						{'A billable base metric is used to measure usage, and act as a foundation of pricing (e.g., API calls for an API product).'}
					</p>
					{/* <Spacer height={'16px'} /> */}
					{/* <Link to='/usage-tracking/billable-metric/add-meter'>
						<Button className='w-32 flex gap-2 bg-[#0F172A] '>
							<FiFolderPlus />
							<span>Add Meter</span>
						</Button>
					</Link> */}
				</div>
			</div>
		);
	}

	return (
		<div className='page'>
			<SectionHeader className='' title='Invoices'>
				<div className='flex gap-2 w-full'>
					<button className='px-2 py-1'>
						<IoSearch className='size-5 text-[#09090B] ' />
					</button>
					<button className='px-2 py-1'>
						<SlidersHorizontal className='size-5 text-[#09090B] ' />
					</button>
					{/* <Link to='/usage-tracking/billable-metric/add-meter'>
						<Button className='w-32 flex gap-2 bg-[#0F172A] '>
							<FiFolderPlus />
							<span>Add Meter</span>
						</Button>
					</Link> */}
				</div>
			</SectionHeader>
			<div className='px-0'>
				<InvoiceTable data={invoiceData?.items || []} />
				<Spacer className='!h-4' />
				<Pagination totalPages={Math.ceil((invoiceData?.pagination.total ?? 1) / limit)} />
			</div>
		</div>
	);
};

export default InvoicesPage;
