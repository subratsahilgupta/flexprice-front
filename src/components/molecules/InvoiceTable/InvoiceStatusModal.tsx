import { Button, FormHeader, Modal, Select, SelectOption, Spacer } from '@/components/atoms';
import { Invoice } from '@/models/Invoice';
import InvoiceApi from '@/utils/api_requests/InvoiceApi';
import { useMutation } from '@tanstack/react-query';
import { FC, useState } from 'react';
import toast from 'react-hot-toast';

interface InvoiceStatusProps {
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

const InvoiceStatusModal: FC<InvoiceStatusProps> = ({ isOpen, onOpenChange, invoice }) => {
	const statusOptions: SelectOption[] = [
		{
			label: 'Void',
			value: 'VOIDED',
			disabled:
				!(invoice?.invoice_status === 'DRAFT' || invoice?.invoice_status === 'FINALIZED') &&
				(invoice?.payment_status === 'FAILED' || invoice?.payment_status === 'PENDING'),
		},
		{
			label: 'Finalize',
			value: 'FINALIZED',
			disabled:
				!(invoice?.invoice_status === 'DRAFT' || invoice?.invoice_status === 'FINALIZED') &&
				(invoice?.payment_status === 'FAILED' || invoice?.payment_status === 'PENDING'),
		},
		{
			label: 'Draft',
			value: 'DRAFT',
		},
	];

	const { isPending, mutate: updateStatus } = useMutation({
		mutationFn: async (status: string) => {
			if (status === 'VOIDED') {
				return await InvoiceApi.voidInvoice(invoice?.id as string);
			} else if (status === 'FINALIZED') {
				return await InvoiceApi.finalizeInvoice(invoice?.id as string);

				// update invoice status to draft
				// update payment status to pending
			} else if (status === 'DRAFT') {
				toast.error('Draft status is yet to be implemented');
				// return await InvoiceApi.voidInvoice(invoice?.id as string);
				// update invoice status to draft
				// update payment status to pending
			}
		},
		onSuccess: () => {
			toast.success('Invoice status updated successfully');
		},
		onError: () => {
			toast.error('Failed to update invoice status');
		},
	});

	const [status, setStatus] = useState(
		invoice ? statusOptions.find((option) => option.value === invoice.invoice_status) || statusOptions[0] : statusOptions[0],
	);

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<div className='card bg-white max-w-lg'>
				<FormHeader
					title='Update Invoice Status'
					variant='form-title'
					subtitle='Please note that updating the status of an invoice will not affect the payment status.'
				/>
				<Spacer className='!my-6' />
				<Select
					label='Invoice Status'
					selectedValue={status.value}
					options={statusOptions}
					onChange={(e) => setStatus(statusOptions.find((option) => option.value === e) || statusOptions[0])}
				/>
				<Spacer className='!my-6' />
				<div className='flex justify-end gap-4'>
					<Button onClick={() => onOpenChange(false)} variant={'outline'} className='btn btn-primary'>
						Cancel
					</Button>
					<Button
						disabled={isPending}
						onClick={() => {
							onOpenChange(false);
							updateStatus(status.value);
						}}
						className='btn btn-primary'>
						Update
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default InvoiceStatusModal;
