import { FormHeader, Spacer, Button, Divider } from '@/components/atoms';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import { captureToPdf } from '@/utils/common/component_to_pdf';
import formatDate from '@/utils/common/format_date';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader } from 'lucide-react';
import { FC, useRef } from 'react';
import toast from 'react-hot-toast';
// import { useParams } from 'react-router-dom';

const formatToShortDate = (dateString: string): string => {
	const date = new Date(dateString);
	const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
	return date.toLocaleDateString('en-US', options);
};

const formatAmount = (amount: number, currency: string): string => {
	return `${getCurrencySymbol(currency)}${amount}`;
};

const formatPriceType = (value: string): string => {
	switch (value) {
		case 'FIXED':
			return 'Recurring';
		case 'USAGE':
			return 'Usage Based';
		default:
			return 'Unknown';
	}
};

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
			<div className='w-full border-t border-gray-200 p-4'>
				<FormHeader className='!mb-0' title='Order Details' variant='sub-header' titleClassName='font-semibold' />

				<div className='overflow-x-auto'>
					<table className='table-auto w-full border-collapse text-left text-sm text-gray-800 my-4 px-4'>
						<thead className='border-b border-gray-200'>
							<tr>
								<th className='py-2 px-2 text-gray-600'>Subscription</th>
								<th className='py-2 px-2 text-gray-600'>Description</th>
								<th className='py-2 px-2 text-center text-gray-600'>Interval</th>
								<th className='py-2 px-2 text-gray-600 text-center'>Quantity</th>
								<th className='py-2 px-2 text-gray-600 text-center'>Unit Price</th>
								<th className='py-2 px-2 text-gray-600 text-right'>Amount</th>
							</tr>
						</thead>
						<tbody>
							{data?.line_items.map((item, index) => {
								return (
									<tr key={index} className='border-b border-gray-100'>
										<td className='py-3 px-2 text-gray-800'>{item.display_name ?? '--'}</td>
										<td className='py-3 px-2 text-gray-800'>{formatPriceType(item.price_type)}</td>
										<td className='py-3 px-2 text-center text-gray-800'>{`${formatToShortDate(item.period_start)} - ${formatToShortDate(item.period_end)}`}</td>
										<td className='py-3 px-2 text-center text-gray-800'>4</td>
										<td className='py-3 px-2 text-center text-gray-800'>{formatAmount(item.amount ?? '--', item.currency)}</td>
										<td className='py-3 px-2 text-right text-gray-800'>{}</td>
									</tr>
								);
							})}
							{/* <tr className="border-b border-gray-100">
							<td className="py-3 px-2 text-gray-800">Glimmer Lamps x</td>
							<td className="py-3 px-2 text-gray-800">Recurring</td>
							<td className="py-3 px-2 text-gray-800">-</td>
							<td className="py-3 px-2 text-center text-gray-800">4</td>
							<td className="py-3 px-2 text-right text-gray-800">$120</td>
							<td className="py-3 px-2 text-right text-gray-800">$250.00</td>
						</tr> */}
						</tbody>
					</table>
				</div>

				<div className='flex justify-end px-4 py-4 border-t border-gray-200'>
					<div className='text-sm text-gray-800 space-y-1 w-1/3'>
						<div className='flex justify-between'>
							<span>Subtotal</span>
							<span>{`${getCurrencySymbol(data?.currency ?? '')}${data?.amount_due}`}</span>
						</div>
						<div className='flex justify-between'>
							<span>Tax</span>
							<span>--</span>
						</div>
						<div className='flex justify-between font-bold text-gray-900 border-t pt-2'>
							<span>Total Amount</span>
							<span>{formatAmount(data?.amount_due ?? 0, data?.currency ?? '')}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default InvoiceDetails;
