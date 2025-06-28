import { Payment } from '@/models/Payment';
import FlexpriceTable, { ColumnData, TooltipCell } from '../Table';
import { formatDateShort } from '@/utils/common/helper_functions';
import { Chip, NoDataCard } from '@/components/atoms';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { CreditCard, Banknote, Receipt, CircleDollarSign } from 'lucide-react';
import { RouteNames } from '@/core/routes/Routes';
import { RedirectCell } from '../Table';

interface Props {
	data: Payment[];
}

const getPaymentMethodIcon = (method: string) => {
	switch (method.toUpperCase()) {
		case 'CARD':
			return <CreditCard className='w-4 h-4' />;
		case 'ACH':
			return <Banknote className='w-4 h-4' />;
		case 'OFFLINE':
			return <Receipt className='w-4 h-4' />;
		case 'CREDITS':
			return <CircleDollarSign className='w-4 h-4' />;
		default:
			return <CreditCard className='w-4 h-4' />;
	}
};

const getPaymentMethodLabel = (method: string) => {
	switch (method.toUpperCase()) {
		case 'CARD':
			return 'Card';
		case 'ACH':
			return 'Bank Transfer';
		case 'OFFLINE':
			return 'Offline';
		case 'CREDITS':
			return 'Wallet Credits';
		default:
			return method;
	}
};

const columns: ColumnData<Payment>[] = [
	{
		title: 'ID',
		width: 200,
		render(rowData) {
			return <TooltipCell tooltipContent={rowData.id} tooltipText={rowData.id} />;
		},
	},
	{
		title: 'Invoice ID',
		render: (payment) => {
			if (payment.destination_type.toUpperCase() === 'INVOICE') {
				return (
					<RedirectCell redirectUrl={`${RouteNames.invoices}/${payment.destination_id}`}>
						{payment.invoice_number || payment.destination_id}
					</RedirectCell>
				);
			}
			return <span>{payment.destination_id}</span>;
		},
	},
	{
		title: 'Date',
		render: (payment) => formatDateShort(payment.created_at),
	},
	{
		title: 'Status',
		render: (payment) => (
			<Chip
				label={toSentenceCase(payment.payment_status)}
				variant={payment.payment_status.toLowerCase() === 'succeeded' ? 'success' : 'failed'}
			/>
		),
	},
	{
		title: 'Payment Method',
		render: (payment) => (
			<div className='flex items-center gap-2'>
				{getPaymentMethodIcon(payment.payment_method_type)}
				<span className='text-sm text-gray-700'>{getPaymentMethodLabel(payment.payment_method_type)}</span>
			</div>
		),
	},
	{
		title: 'Amount',
		render: (payment) => `${getCurrencySymbol(payment.currency)} ${payment.amount}`,
	},
];

const InvoicePaymentsTable = ({ data }: Props) => {
	if (data?.length === 0) {
		return (
			<div className='my-6'>
				<NoDataCard title='Payments' subtitle='No payments found' />
			</div>
		);
	}

	return (
		<div>
			<FlexpriceTable showEmptyRow columns={columns} data={data} />
		</div>
	);
};

export default InvoicePaymentsTable;
