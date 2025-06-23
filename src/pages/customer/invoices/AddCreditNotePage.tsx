import { Button, Checkbox, Dialog, Input, Page, Select, SelectOption, Textarea } from '@/components/atoms';
import { Skeleton } from '@/components/ui/skeleton';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import InvoiceApi from '@/api/InvoiceApi';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditNoteReason } from '@/models/CreditNote';
import { CreateCreditNoteLineItemRequest, CreateCreditNoteParams } from '@/types/dto/CreditNote';
import CreditNoteApi from '@/api/CreditNoteApi';

interface LineItemForm {
	id: string;
	selected: boolean;
	amount: number;
	max_amount: number;
	display_name: string;
}

// Helper function to safely format currency amounts
const formatAmount = (amount: string | number | undefined): string => {
	return Number(amount || 0).toFixed(2);
};

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

	// Initialize line items when invoice data is loaded
	useEffect(() => {
		if (invoice?.line_items) {
			const initialLineItems: LineItemForm[] = invoice.line_items.map((item) => ({
				id: item.id,
				selected: false,
				amount: 0,
				max_amount: item.amount,
				display_name: item.display_name,
			}));
			setLineItems(initialLineItems);
		}
	}, [invoice]);

	// Update breadcrumbs when invoice data is loaded
	useEffect(() => {
		setSegmentLoading(2, true);
		setSegmentLoading(3, true);

		if (invoice) {
			updateBreadcrumb(2, invoice.customer?.external_id || 'Customer');
			updateBreadcrumb(3, `Invoice ${invoice.invoice_number}`);
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
			navigate(`/customers/${invoice?.customer_id}/invoices`);
		},
		onError: (error) => {
			console.error('Failed to create credit note:', error);
		},
	});

	// Calculate totals
	const selectedLineItems = lineItems.filter((item) => item.selected);
	const totalCreditAmount = selectedLineItems.reduce((sum, item) => {
		const itemAmount = parseFloat(String(item.amount)) || 0;
		console.log('Item amount:', item.amount, 'Parsed amount:', itemAmount, 'Running sum:', sum + itemAmount);
		return sum + itemAmount;
	}, 0);

	console.log('Total credit amount:', totalCreditAmount);
	console.log(
		'Selected line items:',
		selectedLineItems.map((item) => ({ id: item.id, amount: item.amount, type: typeof item.amount })),
	);

	// Handle line item selection
	const handleLineItemToggle = (itemId: string) => {
		setLineItems((prev) =>
			prev.map((item) => (item.id === itemId ? { ...item, selected: !item.selected, amount: !item.selected ? item.max_amount : 0 } : item)),
		);
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
		if (!selectedReason || selectedLineItems.length === 0 || !invoice_id) {
			return;
		}

		const creditNoteLineItems: CreateCreditNoteLineItemRequest[] = selectedLineItems.map((item) => ({
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
			<div>
				<Skeleton className='h-48 mb-4' />
				<Skeleton className='h-48 mb-4' />
				<Skeleton className='h-48 mb-4' />
			</div>
		);
	}

	return (
		<Page>
			{/* Confirmation Dialog */}
			<Dialog
				isOpen={showConfirmModal}
				onOpenChange={setShowConfirmModal}
				title='Confirm Credit Note Creation'
				description={`${getCurrencySymbol(invoice?.currency || '')}${formatAmount(totalCreditAmount)} will be credited to ${invoice?.customer?.name}'s balance. This action cannot be undone.`}>
				<div className='flex justify-end gap-3 mt-6'>
					<Button onClick={() => setShowConfirmModal(false)} variant='outline' className='px-4 py-2'>
						Cancel
					</Button>
					<Button
						onClick={() => {
							setShowConfirmModal(false);
							handleSubmit();
						}}
						disabled={createCreditNoteMutation.isPending}
						className='px-4 py-2'>
						{createCreditNoteMutation.isPending ? 'Creating...' : 'Issue Credit Note'}
					</Button>
				</div>
			</Dialog>

			{/* Page Header */}
			<div className='mb-8'>
				<div className='flex items-center gap-3 mb-2'>
					<h1 className='text-2xl font-semibold text-gray-900'>Issue credit note</h1>
				</div>
				<p className='text-gray-500 text-sm'>{invoice?.invoice_number}</p>
			</div>

			{/* Invoice Summary Card */}
			<div className='bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm'>
				<div className='flex justify-between items-center'>
					<div>
						<h3 className='text-lg font-medium text-gray-900 mb-1'>{invoice?.invoice_number}</h3>
						<p className='text-sm text-gray-500'>Current amount due</p>
					</div>
					<div className='text-right'>
						<div className='text-2xl font-semibold text-gray-900'>
							{getCurrencySymbol(invoice?.currency || '')}
							{formatAmount(invoice?.amount_due)}
						</div>
					</div>
				</div>
			</div>

			{/* Main Form Card */}
			<div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
				{/* Reason Selector */}
				<div className='p-6 border-b border-gray-200'>
					<h3 className='text-base font-medium text-gray-900 mb-4'>Reason for credit note</h3>
					<Select
						options={reasonOptions}
						value={selectedReason}
						onChange={(value) => setSelectedReason(value as CreditNoteReason)}
						placeholder='Select a reason'
						className='max-w-md'
					/>
				</div>

				{/* Line Items Section */}
				<div className='p-6 border-b border-gray-200'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='text-base font-medium text-gray-900'>Select line items to credit</h3>
						<span className='text-sm text-gray-500'>Credit amount</span>
					</div>

					<div className='space-y-3'>
						{lineItems.map((item) => (
							<div
								key={item.id}
								className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors'>
								<div className='flex items-center space-x-3 flex-1'>
									<Checkbox checked={item.selected} onCheckedChange={() => handleLineItemToggle(item.id)} />
									<div className='flex-1'>
										<div className='font-medium text-gray-900 text-sm'>{item.display_name}</div>
										<div className='text-xs text-gray-500 mt-1'>
											Max: {getCurrencySymbol(invoice?.currency || '')}
											{formatAmount(item.max_amount)}
										</div>
									</div>
								</div>
								<div className='ml-4'>
									<div className='flex items-center gap-2'>
										<span className='text-sm text-gray-500 font-medium'>$</span>
										<Input
											variant='formatted-number'
											value={item.amount}
											onChange={(value) => handleAmountChange(item.id, value)}
											disabled={!item.selected}
											min={0}
											max={item.max_amount}
											step={0.01}
											className='w-20 text-right text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500'
											placeholder='0.00'
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Totals Section */}
				<div className='p-6 border-b border-gray-200 bg-gray-50'>
					<div className='space-y-3'>
						<div className='flex justify-between text-sm'>
							<span className='text-gray-600'>Total amount to credit</span>
							<span className='font-semibold text-gray-900'>
								{getCurrencySymbol(invoice?.currency || '')}
								{formatAmount(totalCreditAmount)}
							</span>
						</div>
						<div className='flex justify-between text-base font-semibold pt-2 border-t border-gray-200'>
							<span className='text-gray-900'>Total amount credited to customer balance</span>
							<span className='text-gray-900'>
								{getCurrencySymbol(invoice?.currency || '')}
								{formatAmount(totalCreditAmount)}
							</span>
						</div>
					</div>
				</div>

				{/* Memo Section */}
				<div className='p-6'>
					<Textarea
						label='Memo (optional)'
						value={memo}
						onChange={(value) => setMemo(value)}
						placeholder='This will appear on the credit note'
						rows={3}
						className='resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500'
					/>
					<p className='text-xs text-gray-500 mt-2'>This will appear on the credit note</p>
				</div>
			</div>

			{/* Action Button */}
			<div className='mt-6 flex justify-end'>
				<Button
					onClick={() => setShowConfirmModal(true)}
					disabled={!selectedReason || selectedLineItems.length === 0 || createCreditNoteMutation.isPending}>
					Create
				</Button>
			</div>
		</Page>
	);
};

export default AddCreditNotePage;
