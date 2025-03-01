import { FormHeader, Spacer, Button, Divider, Page } from '@/components/atoms';
import { DropdownMenu, DropdownMenuOption, InvoiceLineItemTable } from '@/components/molecules';
import InvoicePaymentStatusModal from '@/components/molecules/InvoiceTable/InvoicePaymentStatusModal';
import InvoiceStatusModal from '@/components/molecules/InvoiceTable/InvoiceStatusModal';
import useUser from '@/hooks/useUser';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import { captureToPdf } from '@/utils/common/component_to_pdf';
import formatDate from '@/utils/common/format_date';
import { useQuery } from '@tanstack/react-query';
import { Download, EllipsisVertical, Loader } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Props {
	invoice_id: string;
	breadcrumb_index: number;
}

const InvoiceDetails: FC<Props> = ({ invoice_id, breadcrumb_index }) => {
	// const { invoice_id } = useParams<{ invoice_id: string }>();
	const navigate = useNavigate();
	const [state, setState] = useState({
		isPaymentModalOpen: false,
		isStatusModalOpen: false,
	});
	const { updateBreadcrumb } = useBreadcrumbsStore();
	const { data, isLoading, isError } = useQuery({
		queryKey: ['fetchInvoice', invoice_id],
		queryFn: async () => {
			return await InvoiceApi.getInvoiceById(invoice_id!);
		},
		enabled: !!invoice_id,
	});

	const { user } = useUser();

	useEffect(() => {
		updateBreadcrumb(breadcrumb_index, data?.invoice_number ?? invoice_id);
	}, [invoice_id, data?.invoice_number, breadcrumb_index, updateBreadcrumb]);

	const dropdownOptions: DropdownMenuOption[] = [
		{
			label: 'Update Invoice Status',
			onSelect: () => {
				setState({
					...state,
					isStatusModalOpen: true,
				});
			},
		},
		{
			label: 'Update Payment Status',
			onSelect: () => {
				setState({
					...state,
					isPaymentModalOpen: true,
				});
			},
		},
		{
			label: 'Issue a Credit Note',
			disabled: data?.payment_status === 'PENDING' || data?.payment_status === 'FAILED',
			onSelect: () => {
				navigate(`/customer-management/customers/${data?.customer_id}/invoice/${data?.id}/credit-note`);
			},
		},
	];

	const customerInfoClass = 'text-sm text-[#71717A] mb-[2px]';
	const invoiceref = useRef<HTMLDivElement>(null);

	const handleDownlaod = () => {
		captureToPdf(invoiceref, 'invoice');
	};

	if (isLoading)
		return (
			<div className='flex justify-center items-center h-96'>
				<Loader />
			</div>
		);

	if (isError) {
		toast.error('Something went wrong');
	}

	return (
		<Page className='space-y-6'>
			<InvoiceStatusModal
				invoice={data}
				isOpen={state.isStatusModalOpen}
				onOpenChange={(open) => {
					setState({
						...state,
						isStatusModalOpen: open,
					});
				}}
			/>
			<InvoicePaymentStatusModal
				invoice={data}
				isOpen={state.isPaymentModalOpen}
				onOpenChange={(open) => {
					setState({
						...state,
						isPaymentModalOpen: open,
					});
				}}
			/>
			<div ref={invoiceref} className=' mt-6 rounded-xl border border-gray-300 p-6'>
				<div className='p-4'>
					<div className='w-full flex justify-between items-center'>
						<FormHeader title='Invoice Details' variant='sub-header' titleClassName='font-semibold' />
						<div className='flex gap-4 items-center'>
							<Button data-html2canvas-ignore='true' onClick={handleDownlaod}>
								<Download />
								<span>Download</span>
							</Button>
							<DropdownMenu
								options={dropdownOptions}
								trigger={
									<Button variant={'outline'} className='size-9 '>
										<EllipsisVertical />
									</Button>
								}></DropdownMenu>
						</div>
					</div>
					<Spacer className='!my-6' />
					<div className='w-full grid grid-cols-3 gap-4'>
						<p className='text-[#71717A] text-sm'>Invoice Number</p>
						<p className='text-[#71717A] text-sm'>Date of Issue</p>
						<p className='text-[#71717A] text-sm'>Date Due</p>
					</div>
					<div className='w-full grid grid-cols-3 gap-4'>
						<p className='text-[#09090B] text-sm'>{data?.invoice_number}</p>
						<p className='text-[#09090B] text-sm'>{formatDate(data?.created_at ?? '')}</p>
						<p className='text-[#09090B] text-sm'>{formatDate(data?.due_date ?? '')}</p>
					</div>
				</div>
				<div className='my-3 mx-3'>
					<Divider />
				</div>

				<div className='grid grid-cols-2  p-4 border-b border-gray-200'>
					<div className='text-left'>
						<FormHeader className='!mb-2' title={user?.tenant.name} variant='sub-header' titleClassName='font-semibold' />
						<p className={customerInfoClass}>{user?.tenant.name}</p>
						<p className={customerInfoClass}>{user?.email}</p>
						<p className={customerInfoClass}>{'--'}</p>
					</div>

					<div>
						<FormHeader className='!mb-2' title='Bill to' variant='sub-header' titleClassName='font-semibold' />
						<p className={customerInfoClass}>{data?.customer?.name || '--'}</p>
						<p className={customerInfoClass}>{data?.customer?.address_line1 || '--'}</p>
						<p className={customerInfoClass}>{data?.customer?.address_line2 || '--'}</p>
					</div>
				</div>
				<InvoiceLineItemTable title='Order Details' data={data?.line_items ?? []} amount_due={data?.amount_due} currency={data?.currency} />
			</div>
		</Page>
	);
};
export default InvoiceDetails;
