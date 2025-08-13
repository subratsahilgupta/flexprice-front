import { Payment } from '@/models/Payment';
import FlexpriceTable, { ColumnData, TooltipCell } from '../Table';
import { formatDateShort } from '@/utils/common/helper_functions';
import { Chip, NoDataCard } from '@/components/atoms';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { CreditCard, Banknote, Receipt, CircleDollarSign, ExternalLink, Copy } from 'lucide-react';
import { RouteNames } from '@/core/routes/Routes';
import { RedirectCell } from '../Table';
import { PAYMENT_METHOD_TYPE } from '@/constants';
import DropdownMenu, { DropdownMenuOption } from '../DropdownMenu';
import toast from 'react-hot-toast';
import { FC } from 'react';

interface Props {
	data: Payment[];
}

interface PaymentTableMenuProps {
	payment: Payment;
}

const PaymentTableMenu: FC<PaymentTableMenuProps> = ({ payment }) => {
	const handleCopyPaymentLink = async () => {
		if (payment.payment_url) {
			try {
				await navigator.clipboard.writeText(payment.payment_url);
				toast.success('Payment link copied to clipboard!');
			} catch (error) {
				console.error('Failed to copy payment link:', error);
				toast.error('Failed to copy payment link. Please try again.');
			}
		}
	};

	// Create menu options based on payment method and availability of payment_url
	const menuOptions: DropdownMenuOption[] = [];

	// Only add "Copy Link" option for payment links that have a payment_url
	if (payment.payment_method_type.toUpperCase() === PAYMENT_METHOD_TYPE.PAYMENT_LINK && payment.payment_url) {
		menuOptions.push({
			label: 'Copy Link',
			icon: <Copy className='w-4 h-4' />,
			onSelect: handleCopyPaymentLink,
		});
	}

	// Always show the dropdown menu, even if options array is empty
	return <DropdownMenu options={menuOptions} />;
};

const getPaymentMethodIcon = (method: string) => {
	switch (method.toUpperCase()) {
		case PAYMENT_METHOD_TYPE.CARD:
			return <CreditCard className='w-4 h-4' />;
		case PAYMENT_METHOD_TYPE.ACH:
			return <Banknote className='w-4 h-4' />;
		case PAYMENT_METHOD_TYPE.OFFLINE:
			return <Receipt className='w-4 h-4' />;
		case PAYMENT_METHOD_TYPE.CREDITS:
			return <CircleDollarSign className='w-4 h-4' />;
		case PAYMENT_METHOD_TYPE.PAYMENT_LINK:
			return <ExternalLink className='w-4 h-4' />;
		default:
			return <CreditCard className='w-4 h-4' />;
	}
};

const getPaymentMethodLabel = (method: string) => {
	switch (method.toUpperCase()) {
		case PAYMENT_METHOD_TYPE.CARD:
			return 'Card';
		case PAYMENT_METHOD_TYPE.ACH:
			return 'Bank Transfer';
		case PAYMENT_METHOD_TYPE.OFFLINE:
			return 'Offline';
		case PAYMENT_METHOD_TYPE.CREDITS:
			return 'Wallet Credits';
		case PAYMENT_METHOD_TYPE.PAYMENT_LINK:
			return 'Payment Link';
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
		render: (payment) => {
			const status = payment.payment_status.toUpperCase();
			let variant: 'warning' | 'success' | 'failed' | 'default' = 'default';

			if (status === 'PENDING' || status === 'PROCESSING' || status === 'INITIATED') {
				variant = 'warning';
			} else if (status === 'SUCCEEDED') {
				variant = 'success';
			} else if (status === 'FAILED') {
				variant = 'failed';
			}

			return <Chip label={toSentenceCase(payment.payment_status)} variant={variant} />;
		},
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
	{
		title: '',
		width: 50,
		render: (payment) => <PaymentTableMenu payment={payment} />,
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
