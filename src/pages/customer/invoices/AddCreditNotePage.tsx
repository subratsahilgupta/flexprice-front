import { Button, Dialog, Input, Page, Select, SelectOption, Textarea } from '@/components/atoms';
import { Skeleton } from '@/components/ui/skeleton';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import InvoiceApi from '@/api/InvoiceApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditNote, CreditNoteReason, CreditNoteType } from '@/models/CreditNote';
import { CreateCreditNoteLineItemRequest, CreateCreditNoteParams } from '@/types/dto/CreditNote';
import CreditNoteApi from '@/api/CreditNoteApi';
import { PaymentStatus, formatCurrency, getCurrencySymbol } from '@/constants';
import toast from 'react-hot-toast';
import { RouteNames } from '@/core/routes/Routes';

interface LineItemForm {
	id: string;
	amount: number;
	max_amount: number;
	display_name: string;
	quantity: string;
	unit_price: number;
}

interface CreditNotePreview {
	type: CreditNoteType;
	totalAmount: number;
	effectDescription: string;
	settlementDescription: string;
}

const AddCreditNotePage = () => {
	const { invoice_id } = useParams<{ invoice_id: string }>();
	const { updateBreadcrumb, setSegmentLoading } = useBreadcrumbsStore();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: invoice, isLoading } = useQuery({
		queryKey: ['fetchInvoice', invoice_id],
		queryFn: async () => await InvoiceApi.getInvoiceById(invoice_id!),
		enabled: !!invoice_id,
	});

	// Form state
	const [selectedReason, setSelectedReason] = useState<CreditNoteReason | ''>('');
	const [memo, setMemo] = useState('');
	const [lineItems, setLineItems] = useState<LineItemForm[]>([]);
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	// Business logic: Determine credit note type based on payment status
	const getCreditNoteType = (paymentStatus: string): CreditNoteType => {
		switch (paymentStatus.toUpperCase()) {
			case PaymentStatus.SUCCEEDED:
			case PaymentStatus.PARTIALLY_REFUNDED:
				return CreditNoteType.REFUND;
			case PaymentStatus.FAILED:
			case PaymentStatus.PENDING:
			case PaymentStatus.PROCESSING:
				return CreditNoteType.ADJUSTMENT;
			default:
				return CreditNoteType.ADJUSTMENT;
		}
	};

	// Initialize line items when invoice data is loaded
	useEffect(() => {
		if (invoice?.line_items) {
			const initialLineItems: LineItemForm[] = invoice.line_items.map((item) => {
				const quantity = parseFloat(item.quantity) || 1;
				const unit_price = item.amount / quantity;

				return {
					id: item.id,
					amount: 0, // Initialize with 0 as requested
					max_amount: item.amount, // Use original line item amount as max
					display_name: item.display_name,
					quantity: item.quantity,
					unit_price: unit_price,
				};
			});
			setLineItems(initialLineItems);
		}
	}, [invoice]);

	// Update breadcrumbs when invoice data is loaded
	useEffect(() => {
		setSegmentLoading(2, true);

		if (invoice) {
			updateBreadcrumb(2, invoice.customer?.external_id || 'Customer');
			updateBreadcrumb(4, invoice.invoice_number);
			updateBreadcrumb(5, 'Issue Credit Note');
		}
	}, [invoice, updateBreadcrumb, setSegmentLoading]);

	const reasonOptions: SelectOption[] = [
		{ label: 'Duplicate', value: CreditNoteReason.DUPLICATE },
		{ label: 'Fraudulent', value: CreditNoteReason.FRAUDULENT },
		{ label: 'Order Change', value: CreditNoteReason.ORDER_CHANGE },
		{ label: 'Unsatisfactory', value: CreditNoteReason.UNSATISFACTORY },
		{ label: 'Service Issue', value: CreditNoteReason.SERVICE_ISSUE },
		{ label: 'Billing Error', value: CreditNoteReason.BILLING_ERROR },
		{ label: 'Subscription Cancellation', value: CreditNoteReason.SUBSCRIPTION_CANCELLATION },
	];

	// Create credit note mutation
	const createCreditNoteMutation = useMutation({
		mutationFn: (params: CreateCreditNoteParams) => CreditNoteApi.createCreditNote(params),
		onSuccess: (data: CreditNote) => {
			queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
			navigate(`${RouteNames.creditNotes}/${data.id}`);
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Failed to create credit note');
		},
	});

	// Calculate totals - only include line items with amount > 0
	const validLineItems = lineItems.filter((item) => item.amount > 0);
	const totalCreditAmount = validLineItems.reduce((sum, item) => sum + item.amount, 0);

	// Generate credit note preview
	const getCreditNotePreview = (): CreditNotePreview => {
		if (!invoice) {
			return {
				type: CreditNoteType.ADJUSTMENT,
				totalAmount: 0,
				effectDescription: '',
				settlementDescription: '',
			};
		}

		const creditNoteType = getCreditNoteType(invoice.payment_status);

		let effectDescription = '';
		let settlementDescription = '';

		if (creditNoteType === CreditNoteType.REFUND) {
			effectDescription = 'This credit note will process a refund for the paid amount.';
			settlementDescription = "The refunded amount will be credited to the customer's original payment method or wallet balance.";
		} else {
			effectDescription = 'This credit note will adjust the current invoice amount.';
			settlementDescription = 'The adjustment will be applied to the current billing period, reducing the amount due.';
		}

		return {
			type: creditNoteType,
			totalAmount: totalCreditAmount,
			effectDescription,
			settlementDescription,
		};
	};

	// Handle amount change
	const handleAmountChange = (itemId: string, value: string) => {
		const numericValue = parseFloat(value) || 0;
		setLineItems((prev) =>
			prev.map((item) => (item.id === itemId ? { ...item, amount: Math.min(Math.max(0, numericValue), item.max_amount) } : item)),
		);
	};

	// Handle form submission
	const handleSubmit = () => {
		if (!selectedReason || validLineItems.length === 0 || !invoice_id) {
			return;
		}

		const creditNoteLineItems: CreateCreditNoteLineItemRequest[] = validLineItems.map((item) => ({
			invoice_line_item_id: item.id,
			display_name: item.display_name,
			amount: item.amount,
		}));

		const params: CreateCreditNoteParams = {
			invoice_id: invoice_id,
			reason: selectedReason as CreditNoteReason,
			memo: memo || undefined,
			line_items: creditNoteLineItems,
		};

		createCreditNoteMutation.mutate(params);
	};

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<Skeleton className='h-32' />
				<Skeleton className='h-48' />
				<Skeleton className='h-32' />
			</div>
		);
	}

	const creditNotePreview = getCreditNotePreview();

	return (
		<Page>
			{/* Confirmation Dialog */}
			<Dialog
				isOpen={showConfirmModal}
				onOpenChange={setShowConfirmModal}
				title='Confirm Credit Note'
				description='Review the details before proceeding.'>
				<div className='space-y-6 mt-6'>
					{/* Summary */}
					<div className='p-4 bg-gray-50 rounded-lg space-y-3'>
						<div className='flex justify-between items-center'>
							<span className='text-sm text-gray-600'>Credit Note Type</span>
							<span
								className={`text-sm px-2 py-1 rounded ${
									creditNotePreview.type === CreditNoteType.REFUND ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
								}`}>
								{creditNotePreview.type}
							</span>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-sm text-gray-600'>Total Amount</span>
							<span className='text-sm font-medium'>{formatCurrency(creditNotePreview.totalAmount, invoice?.currency || 'USD')}</span>
						</div>
						<div className='text-sm text-gray-600'>{creditNotePreview.effectDescription}</div>
					</div>

					{/* Line Items */}
					<div className='space-y-3'>
						<h4 className='text-sm font-medium'>Line Items to Credit</h4>
						<div className='space-y-2'>
							{validLineItems.map((item) => (
								<div key={item.id} className='flex justify-between text-sm'>
									<span className='text-gray-600'>{item.display_name}</span>
									<span className='font-medium'>{formatCurrency(item.amount, invoice?.currency || 'USD')}</span>
								</div>
							))}
						</div>
					</div>

					{/* Actions */}
					<div className='flex justify-end gap-3 pt-4 border-t'>
						<Button onClick={() => setShowConfirmModal(false)} variant='outline'>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setShowConfirmModal(false);
								handleSubmit();
							}}
							disabled={createCreditNoteMutation.isPending}>
							{createCreditNoteMutation.isPending ? 'Creating...' : 'Create Credit Note'}
						</Button>
					</div>
				</div>
			</Dialog>

			{/* Page Content */}
			<div className='space-y-6'>
				{/* Header */}
				<h1 className='text-xl font-medium'>Issue Credit Note</h1>

				{/* Invoice Summary */}
				<div className='bg-white border rounded-lg p-6'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						<div>
							<div className='text-sm font-medium'>{invoice?.invoice_number}</div>
							<div className='text-sm text-gray-500'>Invoice Number</div>
						</div>
						<div>
							<div className='text-sm font-medium'>{formatCurrency(invoice?.amount_paid || 0, invoice?.currency || 'USD')}</div>
							<div className='text-sm text-gray-500'>Amount Paid</div>
						</div>
						<div>
							<div className='text-sm font-medium'>
								{formatCurrency(parseFloat(invoice?.amount_remaining || '0'), invoice?.currency || 'USD')}
							</div>
							<div className='text-sm text-gray-500'>Amount Remaining</div>
						</div>
					</div>
				</div>

				{/* Form */}
				<div className='bg-white border rounded-lg divide-y'>
					{/* Line Items */}
					<div className='p-6'>
						<div className='flex justify-between items-center mb-4'>
							<h3 className='text-sm font-medium'>Line items to credit</h3>
							<span className='text-sm text-gray-500'>Credit amount</span>
						</div>
						<div className='space-y-4'>
							{lineItems.map((item) => (
								<div key={item.id} className='flex items-center justify-between'>
									<div className='flex-1'>
										<div className='text-sm font-medium'>{item.display_name}</div>
										<div className='text-sm text-gray-500'>{formatCurrency(item.unit_price, invoice?.currency || 'USD')}</div>
									</div>
									<div className='ml-4'>
										<Input
											variant='formatted-number'
											value={item.amount.toString()}
											onChange={(value) => handleAmountChange(item.id, value)}
											min={0}
											inputPrefix={getCurrencySymbol(invoice?.currency || 'USD')}
											max={item.max_amount}
											step={0.01}
											className='w-32 text-right'
											placeholder='0.00'
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Totals */}
					<div className='p-6'>
						<div className='space-y-3'>
							<div className='flex justify-between text-sm'>
								<span className='text-gray-600'>Total amount to credit</span>
								<span className='font-medium'>{formatCurrency(totalCreditAmount, invoice?.currency || 'USD')}</span>
							</div>
							<div className='flex justify-between text-sm font-medium pt-3 border-t'>
								<span>{creditNotePreview.type === CreditNoteType.REFUND ? 'Amount to be refunded' : 'Amount to be adjusted'}</span>
								<span>{formatCurrency(totalCreditAmount, invoice?.currency || 'USD')}</span>
							</div>
						</div>
					</div>

					{/* Reason */}
					<div className='p-6'>
						<h3 className='text-sm font-medium mb-4'>Reason for credit note</h3>
						<Select
							options={reasonOptions}
							value={selectedReason}
							onChange={(value) => setSelectedReason(value as CreditNoteReason)}
							placeholder='Select a reason'
							className='max-w-md'
						/>
					</div>

					{/* Memo */}
					<div className='p-6'>
						<Textarea
							label='Memo (optional)'
							value={memo}
							onChange={(value) => setMemo(value)}
							placeholder='This will appear on the credit note'
							rows={3}
							className='resize-none'
						/>
					</div>
				</div>

				{/* Actions */}
				<div className='flex justify-end'>
					<Button
						isLoading={createCreditNoteMutation.isPending}
						onClick={() => setShowConfirmModal(true)}
						disabled={!selectedReason || validLineItems.length === 0 || createCreditNoteMutation.isPending}>
						Create Credit Note
					</Button>
				</div>
			</div>
		</Page>
	);
};

export default AddCreditNotePage;
