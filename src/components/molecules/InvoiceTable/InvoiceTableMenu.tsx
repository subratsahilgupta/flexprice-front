import { Invoice } from '@/models/Invoice';
import { FC, useState } from 'react';
import { DropdownMenu } from '..';
import { DropdownMenuOption } from '../DropdownMenu/DropdownMenu';
import { useMutation } from '@tanstack/react-query';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import toast from 'react-hot-toast';
import InvoiceStatusModal from './InvoiceStatusModal';
import InvoicePaymentStatusModal from './InvoicePaymentStatusModal';
import { useNavigate } from 'react-router-dom';
import { refetchQueries } from '@/core/tanstack/ReactQueryProvider';
interface Props {
	data: Invoice;
}

const InvoiceTableMenu: FC<Props> = ({ data }) => {
	const navigate = useNavigate();

	const { mutate: attemptPayment } = useMutation({
		mutationFn: async (invoice_id: string) => {
			return await InvoiceApi.attemptPayment(invoice_id);
		},
		onSuccess: () => {
			toast.success('Invoice Paid');
			refetchQueries();
		},
		onError: () => {
			toast.error('Unable to pay invoice');
		},
	});

	const { mutate: downloadInvoice } = useMutation({
		mutationFn: async (invoice_id: string) => {
			return await InvoiceApi.getInvoicePdf(invoice_id);
		},
		onSuccess: () => {
			toast.success('Invoice downloaded');
		},
		onError: () => {
			toast.error('Unable to download invoice');
		},
	});

	const [state, setState] = useState<{
		isPaymentModalOpen: boolean;
		isStatusModalOpen: boolean;
		activeInvoice?: Invoice;
	}>({
		isPaymentModalOpen: false,
		isStatusModalOpen: false,
	});

	const menuOptions: DropdownMenuOption[] = [
		{
			label: 'Download Invoice',
			onSelect: () => {
				downloadInvoice(data.id);
			},
		},
		{
			label: 'Attempt Payment',
			onSelect: () => {
				attemptPayment(data.id);
			},
			disabled: data?.payment_status === 'SUCCEEDED' || data?.invoice_status === 'VOIDED' || data.amount_remaining === '0',
		},
		{
			label: 'Update Invoice Status',
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
			disabled: data?.payment_status === 'PENDING' || data?.payment_status === 'FAILED',
			onSelect: () => {
				navigate(`/customer-management/customers/${data?.customer_id}/invoice/${data?.id}/credit-note`);
			},
		},
		{
			label: 'View Customer',
			onSelect: () => {
				navigate(`/customer-management/customers/${data.customer_id}`);
			},
		},
		{
			label: 'View Subscription',
			onSelect() {
				navigate(`/customer-management/customers/${data.customer_id}/subscription/${data.subscription_id}`);
			},
		},
	];
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
			<DropdownMenu options={menuOptions} />
		</div>
	);
};

export default InvoiceTableMenu;
