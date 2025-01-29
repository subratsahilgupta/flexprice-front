import { queryClient } from '@/App';
import { Button, CheckboxRadioGroupItem, FormHeader, Modal, Select, Spacer } from '@/components/atoms';
import { Invoice } from '@/models/Invoice';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import { useMutation } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	invoice?: Invoice;
}

/**
 * invoice status

	- for void
		- invoice_status = draft | finalize
		- payment_status = failed | pending 
	    
	- for finalize
		- invoice_status = draft
		- payment_status = pending

payment status
	- from pending -> sucess | failed | pending
	- from failed -> sucess | failed | pending
	- from success -> disabled


 * 
 */

const InvoicePaymentStatusModal: FC<Props> = ({ isOpen, onOpenChange, invoice }) => {
	const paymentOptions: CheckboxRadioGroupItem[] = [
		{
			label: 'Sucessful',
			value: 'SUCCEEDED',
			description: 'This action will set the payment status to successful',
			disabled: invoice?.payment_status === 'SUCCEEDED',
		},
		{
			label: 'Failed',
			value: 'FAILED',
			description: 'This action will set the payment status to failed',
			disabled: invoice?.payment_status === 'SUCCEEDED',
		},
		{
			label: 'Pending',
			value: 'PENDING',
			description: 'This action will set the payment status to pending',
			disabled: invoice?.payment_status === 'SUCCEEDED',
		},
	];

	const [status, setstatus] = useState(paymentOptions.find((option) => option.value === invoice?.invoice_status) || paymentOptions[0]);

	useEffect(() => {
		if (invoice) {
			setstatus(paymentOptions.find((option) => option.value === invoice?.payment_status) || paymentOptions[0]);
		}
	}, [invoice]);

	const { mutate: updatePayment, isPending } = useMutation({
		mutationFn: async ({ invoiceId, status }: { invoiceId: string; status: string }) => {
			return await InvoiceApi.updateInvoicePaymentStatus(invoiceId, status);
		},
		async onSuccess() {
			toast.success('Payment status updated successfully');
			await queryClient.invalidateQueries({
				queryKey: ['fetchInvoices'],
			});
			await queryClient.refetchQueries({
				queryKey: ['fetchInvoices'],
			});
		},
		onError() {
			toast.error('Failed to update payment status');
		},
	});

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<div className='card bg-white max-w-lg'>
				<FormHeader
					title='Update Payment Status'
					variant='form-title'
					subtitle='Please note that updating the payment status of an invoice will not re-trigger the payment collection process.'
				/>
				<Spacer className='!my-6' />
				<Select
					value={status.value}
					options={paymentOptions}
					isRadio={true}
					onChange={(e) => setstatus(paymentOptions.find((option) => option.value === e) || paymentOptions[0])}
				/>

				<Spacer className='!my-6' />
				<div className='flex justify-end gap-4'>
					<Button
						onClick={() => {
							onOpenChange(false);
						}}
						variant={'outline'}
						className='btn btn-primary'>
						Cancel
					</Button>

					<Button
						disabled={isPending}
						onClick={() => {
							onOpenChange(false);
							updatePayment({ invoiceId: invoice?.id || '', status: status.value });
						}}
						className='btn btn-primary'>
						Update
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default InvoicePaymentStatusModal;
