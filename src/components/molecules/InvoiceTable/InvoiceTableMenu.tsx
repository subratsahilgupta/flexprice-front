import { Invoice, INVOICE_STATUS } from '@/models/Invoice';
import { FC, useState } from 'react';
import { DropdownMenu, RecordPaymentTopup } from '..';
import { DropdownMenuOption } from '../DropdownMenu/DropdownMenu';
import { useMutation } from '@tanstack/react-query';
import InvoiceApi from '@/api/InvoiceApi';
import toast from 'react-hot-toast';
import InvoiceStatusModal from './InvoiceStatusModal';
import InvoicePaymentStatusModal from './InvoicePaymentStatusModal';
import { useNavigate } from 'react-router-dom';
import { refetchQueries } from '@/core/services/tanstack/ReactQueryProvider';
import { PAYMENT_DESTINATION_TYPE, Payment } from '@/models/Payment';
import { PAYMENT_STATUS } from '@/constants';

interface Props {
	data: Invoice;
}

const InvoiceTableMenu: FC<Props> = ({ data }) => {
	const navigate = useNavigate();

	// const { mutate: attemptPayment } = useMutation({
	// 	mutationFn: async (invoice_id: string) => {
	// 		return await InvoiceApi.attemptPayment(invoice_id);
	// 	},
	// 	onSuccess: () => {
	// 		toast.success('Invoice paid successfully');
	// 		refetchQueries();
	// 	},
	// 	onError: (error: ServerError) => {
	// 		toast.error(error.error.message || 'Unable to pay invoice. Please try again.');
	// 	},
	// });

	const { mutate: downloadInvoice } = useMutation({
		mutationFn: async (invoice_id: string, invoice_number?: string) => {
			return await InvoiceApi.getInvoicePdf(invoice_id, invoice_number);
		},
		onSuccess: () => {
			toast.success('Invoice downloaded');
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Unable to download invoice');
		},
	});

	const [state, setState] = useState<{
		isPaymentModalOpen: boolean;
		isStatusModalOpen: boolean;
		isRecordPaymentDrawerOpen: boolean;
		activeInvoice?: Invoice;
	}>({
		isPaymentModalOpen: false,
		isStatusModalOpen: false,
		isRecordPaymentDrawerOpen: false,
	});

	const menuOptions: DropdownMenuOption[] = [
		{
			label: 'Download Invoice',
			group: 'Actions',
			onSelect: () => {
				downloadInvoice(data.id);
			},
		},
		// {
		// 	label: 'Attempt Payment',
		// 	group: 'Actions',
		// 	onSelect: () => {
		// 		attemptPayment(data.id);
		// 	},
		// 	disabled:
		// 		data?.payment_status === PAYMENT_STATUS.SUCCEEDED || data?.invoice_status === INVOICE_STATUS.VOIDED || data.amount_remaining === 0,
		// },
		{
			label: 'Record Payment',
			group: 'Actions',
			onSelect: () => {
				setState({
					...state,
					isRecordPaymentDrawerOpen: true,
					activeInvoice: data,
				});
			},
			disabled:
				data?.payment_status === PAYMENT_STATUS.SUCCEEDED || data?.invoice_status === INVOICE_STATUS.VOIDED || data.amount_remaining === 0,
		},
		{
			label: 'Update Invoice Status',
			group: 'Actions',
			onSelect: () => {
				setState({
					...state,
					isStatusModalOpen: true,
					activeInvoice: data,
				});
			},
		},
		{
			label: 'Update Payment Status',
			group: 'Actions',
			onSelect: () => {
				setState({
					...state,
					isPaymentModalOpen: true,
					activeInvoice: data,
				});
			},
		},
		{
			label: 'Issue a Credit Note',
			group: 'Actions',
			disabled: data?.invoice_status !== 'FINALIZED' || data?.payment_status === 'REFUNDED',
			onSelect: () => {
				navigate(`/customer-management/customers/${data?.customer_id}/invoice/${data?.id}/credit-note`);
			},
		},
		{
			label: 'View Customer',
			group: 'Connections',
			onSelect: () => {
				navigate(`/customer-management/customers/${data.customer_id}`);
			},
		},
		{
			label: 'View Subscription',
			group: 'Connections',
			onSelect() {
				navigate(`/customer-management/customers/${data.customer_id}/subscription/${data.subscription_id}`);
			},
		},
	];
	const handlePaymentSuccess = (payment: Payment) => {
		// Refetch invoice and payment data
		refetchQueries(['fetchInvoice', data.id]);
		refetchQueries(['payments', data.id]);
		refetchQueries(['fetchInvoices']);
	};
	return (
		<div>
			<InvoiceStatusModal
				invoice={state.activeInvoice}
				isOpen={state.isStatusModalOpen}
				onOpenChange={(open) => {
					setState({
						...state,
						isStatusModalOpen: open,
					});
				}}
			/>
			<InvoicePaymentStatusModal
				invoice={state.activeInvoice}
				isOpen={state.isPaymentModalOpen}
				onOpenChange={(open) => {
					setState({
						...state,
						isPaymentModalOpen: open,
					});
				}}
			/>
			<RecordPaymentTopup
				isOpen={state.isRecordPaymentDrawerOpen}
				onOpenChange={(open: boolean) => {
					setState({
						...state,
						isRecordPaymentDrawerOpen: open,
					});
				}}
				destination_id={data.id}
				destination_type={PAYMENT_DESTINATION_TYPE.INVOICE}
				customer_id={data.customer_id}
				max_amount={Number(data.amount_remaining)}
				currency={data.currency}
				onSuccess={handlePaymentSuccess}
			/>
			<DropdownMenu options={menuOptions} />
		</div>
	);
};

export default InvoiceTableMenu;
