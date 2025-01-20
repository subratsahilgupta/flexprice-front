import { FormHeader, Spacer, Button, Divider } from '@/components/atoms';
import { InvoiceLineItemTable } from '@/components/molecules';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import { captureToPdf } from '@/utils/common/component_to_pdf';
import formatDate from '@/utils/common/format_date';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader } from 'lucide-react';
import { FC, useRef } from 'react';
import toast from 'react-hot-toast';

interface Props {
	invoice_id: string;
}

const InvoiceDetails: FC<Props> = ({ invoice_id }) => {
	// const { invoice_id } = useParams<{ invoice_id: string }>();

	const { data, isLoading, isError } = useQuery({
		queryKey: ['fetchInvoice', invoice_id],
		queryFn: async () => {
			return await InvoiceApi.getInvoiceById(invoice_id!);
		},
		enabled: !!invoice_id,
	});

	const customerInfoClass = 'text-sm text-[#71717A] mb-[2px]';
	const invoiceref = useRef<HTMLDivElement>(null);

	const handleDownlaod = () => {
		captureToPdf(invoiceref, 'invoice');
	};

	if (isLoading) return <Loader />;

	if (isError) {
		toast.error('Something went wrong');
		return (
			<div>
				<p>Something went wrong</p>
			</div>
		);
	}

	return (
		<div ref={invoiceref} className=' mt-6 rounded-xl border border-gray-300 p-6'>
			<div className='p-4'>
				<div className='w-full flex justify-between items-center'>
					<FormHeader className='' title='Invoice Details' variant='sub-header' titleClassName='font-semibold' />
					<Button data-html2canvas-ignore='true' className='w-32 flex gap-2 bg-[#0F172A] ' onClick={handleDownlaod}>
						<Download />
						<span>Download</span>
					</Button>
				</div>
				<Spacer className='!my-6' />
				<div className='w-full flex gap-4  items-center'>
					<p className='text-[#71717A] text-sm'>Invoice Number</p>
					<p className='text-[#09090B] text-sm'>{data?.invoice_number}</p>
				</div>
				<Spacer className='!my-2' />
				<div className='w-full flex gap-4  items-center'>
					<p className='text-[#71717A] text-sm'>Date of Issue</p>
					<p className='text-[#09090B] text-sm'>{formatDate(data?.created_at ?? '')}</p>
				</div>
				<Spacer className='!my-2' />
				<div className='w-full flex gap-4  items-center'>
					<p className='text-[#71717A] text-sm'>Date Due</p>
					<p className='text-[#09090B] text-sm'>{formatDate(data?.due_date ?? '')}</p>
				</div>
			</div>
			<div className='my-3'>
				<Divider />
			</div>

			<div className='grid grid-cols-2  p-4 border-b border-gray-200'>
				<div>
					<FormHeader className='' title='Customer Information' variant='sub-header' titleClassName='font-semibold' />
					<p className={customerInfoClass}>Liam Johnson</p>
					<p className={customerInfoClass}>1234 Main St.</p>
					<p className={customerInfoClass}>Anytown, CA 12345</p>
				</div>

				<div className='text-left'>
					<FormHeader className='' title='ChatGPT Inc.' variant='sub-header' titleClassName='font-semibold' />
					<p className={customerInfoClass}>Liam Johnson</p>
					<p className={customerInfoClass}>1234 Main St.</p>
					<p className={customerInfoClass}>Anytown, CA 12345</p>
				</div>
			</div>
			<InvoiceLineItemTable title='Order Details' data={data?.line_items ?? []} amount_due={data?.amount_due} currency={data?.currency} />
		</div>
	);
};
export default InvoiceDetails;
