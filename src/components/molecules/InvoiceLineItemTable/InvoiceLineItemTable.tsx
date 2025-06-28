import { Button, FormHeader } from '@/components/atoms';
import { LineItem, INVOICE_TYPE } from '@/models/Invoice';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { FC } from 'react';
import { RefreshCw } from 'lucide-react';
interface Props {
	data: LineItem[];
	currency?: string;
	amount_due?: number;
	total?: number;
	subtotal?: number;
	tax?: number;
	discount?: number;
	amount_paid?: number;
	amount_remaining?: number;
	title?: string;
	refetch?: () => void;
	subtitle?: string;
	invoiceType?: INVOICE_TYPE;
}

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

const InvoiceLineItemTable: FC<Props> = ({
	data,
	amount_due,
	currency,
	title,
	refetch,
	invoiceType,
	subtitle,
	discount,
	tax,
	amount_paid,
	amount_remaining,
	subtotal,
	total,
}) => {
	// Calculate total excluding tax for Stripe-style display
	const totalExcludingTax = subtotal !== undefined ? subtotal : total !== undefined && tax !== undefined ? total - tax : undefined;

	return (
		<div className='bg-white'>
			<div className='w-full p-6'>
				<div className='flex justify-between items-center mb-6'>
					<FormHeader
						variant='sub-header'
						className='!mb-0'
						titleClassName='font-semibold text-gray-900'
						subtitleClassName='text-sm text-gray-500 !mb-0 !mt-1'
						title={title}
						subtitle={subtitle}
					/>
					{refetch && (
						<Button
							onClick={() => {
								const icon = document.querySelector('.refresh-icon');
								icon?.classList.add('animate-spin');
								refetch();
								icon?.classList.remove('animate-spin');
							}}
							variant='outline'
							size='sm'>
							<RefreshCw className='refresh-icon h-4 w-4' />
						</Button>
					)}
				</div>

				{/* Line Items Table */}
				<div className='overflow-x-auto mb-8'>
					<table className='w-full border-collapse'>
						<thead>
							<tr className='border-b border-gray-200'>
								<th className='py-3 px-0 text-left text-sm font-medium text-gray-600'>Subscription</th>
								{invoiceType === INVOICE_TYPE.SUBSCRIPTION && (
									<th className='py-3 px-4 text-left text-sm font-medium text-gray-600'>Description</th>
								)}
								{invoiceType === INVOICE_TYPE.SUBSCRIPTION && (
									<th className='py-3 px-4 text-left text-sm font-medium text-gray-600'>Interval</th>
								)}
								<th className='py-3 px-4 text-center text-sm font-medium text-gray-600'>Quantity</th>
								<th className='py-3 px-0 text-right text-sm font-medium text-gray-600'>Amount</th>
							</tr>
						</thead>
						<tbody>
							{data?.map((item, index) => {
								return (
									<tr key={index} className='border-b border-gray-100'>
										<td className='py-4 px-0 text-sm text-gray-900'>{item.display_name ?? '--'}</td>
										{invoiceType === INVOICE_TYPE.SUBSCRIPTION && (
											<td className='py-4 px-4 text-sm text-gray-700'>{formatPriceType(item.price_type)}</td>
										)}
										{invoiceType === INVOICE_TYPE.SUBSCRIPTION && (
											<td className='py-4 px-4 text-sm text-gray-700'>{`${formatToShortDate(item.period_start)} - ${formatToShortDate(item.period_end)}`}</td>
										)}
										<td className='py-4 px-4 text-center text-sm text-gray-700'>{item.quantity ? item.quantity : '--'}</td>
										<td className='py-4 px-0 text-right text-sm text-gray-900 font-medium'>
											{formatAmount(item.amount ?? 0, item.currency)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Stripe-style Summary Section */}
				<div className='flex justify-end'>
					<div className='w-80 space-y-3'>
						{/* Subtotal */}
						{subtotal !== undefined && subtotal !== null && (
							<div className='flex justify-between items-center py-2'>
								<span className='text-sm text-gray-600'>Subtotal</span>
								<span className='text-sm text-gray-900 font-medium'>{formatAmount(subtotal, currency ?? '')}</span>
							</div>
						)}

						{/* Total excluding tax */}
						{totalExcludingTax !== undefined && totalExcludingTax !== null && (
							<div className='flex justify-between items-center py-2'>
								<span className='text-sm text-gray-600'>Total excluding tax</span>
								<span className='text-sm text-gray-900 font-medium'>{formatAmount(totalExcludingTax, currency ?? '')}</span>
							</div>
						)}

						{/* Tax */}
						<div className='flex justify-between items-center py-2'>
							<span className='text-sm text-gray-600'>Tax</span>
							<span className='text-sm text-gray-900 font-medium'>
								{tax !== undefined && tax !== null && tax > 0 ? formatAmount(tax, currency ?? '') : '–'}
							</span>
						</div>

						{/* Discount */}
						{discount !== undefined && discount !== null && discount > 0 && (
							<div className='flex justify-between items-center py-2'>
								<span className='text-sm text-gray-600'>Discount</span>
								<span className='text-sm text-gray-900 font-medium'>−{formatAmount(discount, currency ?? '')}</span>
							</div>
						)}

						{/* Total */}
						{total !== undefined && total !== null && (
							<div className='flex justify-between items-center py-3 border-t border-gray-200'>
								<span className='text-sm font-medium text-gray-900'>Total</span>
								<span className='text-sm font-semibold text-gray-900'>{formatAmount(total, currency ?? '')}</span>
							</div>
						)}

						{/* Amount paid */}
						<div className='flex justify-between items-center py-2'>
							<span className='text-sm text-gray-600'>Amount paid</span>
							<span className='text-sm text-gray-900 font-medium'>
								{amount_paid !== undefined && amount_paid !== null
									? formatAmount(amount_paid, currency ?? '')
									: formatAmount(0, currency ?? '')}
							</span>
						</div>

						{/* Amount remaining */}
						{(amount_remaining !== undefined && amount_remaining !== null && amount_remaining > 0) ||
							(amount_due !== undefined && amount_due !== null && amount_due > 0 && (
								<div className='flex justify-between items-center py-3 border-t border-gray-200'>
									<span className='text-base font-medium text-gray-900'>Amount remaining</span>
									<span className='text-base font-semibold text-gray-900'>
										{formatAmount(amount_remaining ?? amount_due ?? 0, currency ?? '')}
									</span>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default InvoiceLineItemTable;
