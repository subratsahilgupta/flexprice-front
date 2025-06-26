import { FormHeader, Spacer, Divider, Loader } from '@/components/atoms';
import { CreditNoteLineItemTable } from '@/components/molecules';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import CreditNoteApi from '@/api/CreditNoteApi';
import formatDate from '@/utils/common/format_date';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { RouteNames } from '@/core/routes/Routes';
import { CreditNoteStatus, CreditNoteType } from '@/models/CreditNote';
import { Chip } from '@/components/atoms';

interface Props {
	credit_note_id: string;
	breadcrumb_index: number;
}

const getStatusChip = (status: CreditNoteStatus) => {
	switch (status) {
		case CreditNoteStatus.VOIDED:
			return <Chip variant='default' label='Voided' />;
		case CreditNoteStatus.FINALIZED:
			return <Chip variant='success' label='Finalized' />;
		case CreditNoteStatus.DRAFT:
			return <Chip variant='default' label='Draft' />;
		default:
			return <Chip variant='default' label='Draft' />;
	}
};

const getTypeChip = (type: CreditNoteType) => {
	switch (type) {
		case CreditNoteType.REFUND:
			return <Chip variant='default' label='Refund' />;
		case CreditNoteType.ADJUSTMENT:
			return <Chip variant='default' label='Adjustment' />;
		default:
			return <Chip variant='default' label='Unknown' />;
	}
};

const CreditNoteDetails: FC<Props> = ({ credit_note_id, breadcrumb_index }) => {
	const { updateBreadcrumb } = useBreadcrumbsStore();
	const { data, isLoading, isError } = useQuery({
		queryKey: ['fetchCreditNote', credit_note_id],
		queryFn: async () => {
			return await CreditNoteApi.getCreditNoteById(credit_note_id!);
		},
		enabled: !!credit_note_id,
	});

	useEffect(() => {
		updateBreadcrumb(breadcrumb_index, data?.credit_note_number ?? credit_note_id);
	}, [credit_note_id, data?.credit_note_number, breadcrumb_index, updateBreadcrumb]);

	const creditNoteRef = useRef<HTMLDivElement>(null);

	if (isLoading) return <Loader />;

	if (isError) {
		toast.error('Something went wrong');
		return (
			<div className='flex min-h-screen justify-center items-center h-full'>
				<Loader />
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Main Credit Note Card */}
			<div ref={creditNoteRef} className='rounded-xl border border-gray-300 p-6'>
				<div className='p-4'>
					<FormHeader title='Credit Note Details' variant='sub-header' titleClassName='font-semibold' />
					<Spacer className='!my-6' />

					{/* Credit Note Information Grid */}
					<div className='w-full grid grid-cols-4 gap-4 mb-4'>
						<p className='text-[#71717A] text-sm'>Credit Note Number</p>
						<p className='text-[#71717A] text-sm'>Date Created</p>
						<p className='text-[#71717A] text-sm'>Status</p>
						<p className='text-[#71717A] text-sm'>Type</p>
					</div>
					<div className='w-full grid grid-cols-4 gap-4'>
						<p className='text-[#09090B] text-sm font-medium'>{data?.credit_note_number || data?.id?.slice(0, 8)}</p>
						<p className='text-[#09090B] text-sm font-medium'>{formatDate(data?.created_at ?? '')}</p>
						<div className='text-[#09090B] text-sm'>{getStatusChip(data?.credit_note_status ?? CreditNoteStatus.DRAFT)}</div>
						<div className='text-[#09090B] text-sm'>{getTypeChip(data?.credit_note_type ?? CreditNoteType.ADJUSTMENT)}</div>
					</div>
				</div>

				{/* Related Invoice Section */}
				{data?.invoice && (
					<>
						<div className='my-3 mx-3'>
							<Divider />
						</div>
						<div className='p-4 border-b border-gray-200'>
							<FormHeader className='!mb-4' title='Related Invoice' variant='sub-header' titleClassName='font-semibold' />
							<div className='w-full flex justify-between items-center'>
								<p className='text-[#71717A] text-sm'>Invoice Number</p>
								<Link to={`${RouteNames.invoices}/${data.invoice.id}`} className='text-[#09090B] text-sm font-medium hover:underline'>
									{data.invoice.invoice_number || data.invoice.id.slice(0, 8)}
								</Link>
							</div>
						</div>
					</>
				)}

				{/* Memo Section */}
				{data?.memo && (
					<>
						<div className='p-4'>
							<FormHeader className='!mb-4' title='Memo' variant='sub-header' titleClassName='font-semibold' />
							<div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
								<p className='text-[#09090B] text-sm leading-relaxed'>{data.memo}</p>
							</div>
						</div>
					</>
				)}

				{/* Credit Note Line Items */}
				<CreditNoteLineItemTable
					title='Credit Note Details'
					data={data?.line_items ?? []}
					total_amount={data?.total_amount}
					currency={data?.currency}
					total_label='Total Credit Amount'
				/>
			</div>
		</div>
	);
};

export default CreditNoteDetails;
