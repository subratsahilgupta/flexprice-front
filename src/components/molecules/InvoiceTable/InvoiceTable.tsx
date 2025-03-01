import { Invoice } from '@/models/Invoice';
import { FC, useState } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import { formatDateShort, getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
import { Chip } from '@/components/atoms';
import DropdownMenu, { DropdownMenuOption } from '../DropdownMenu';
import { useNavigate } from 'react-router-dom';
import InvoiceStatusModal from './InvoiceStatusModal';
import InvoicePaymentStatusModal from './InvoicePaymentStatusModal';

export interface Props {
	data: Invoice[];
}

const getStatusChip = (status: string) => {
	switch (status.toUpperCase()) {
		case 'VOIDED':
			return <Chip variant='default' label='Void' />;
		case 'FINALIZED':
			return <Chip variant='success' label='Finalized' />;
		case 'DRAFT':
			return <Chip variant='default' label='Draft' />;
		default:
			return <Chip variant='default' label='Draft' />;
	}
};

export const getPaymentStatusChip = (status: string) => {
	switch (status.toUpperCase()) {
		case 'PENDING':
			return <Chip variant='default' label='Pending' />;
		case 'SUCCEEDED':
			return <Chip variant='success' label='Succeeded' />;
		case 'FAILED':
			return <Chip variant='failed' label='Failed' />;
		default:
			return <Chip variant='default' label='Unknown' />;
	}
};

const InvoiceTable: FC<Props> = ({ data }) => {
	const navigate = useNavigate();
	const [state, setState] = useState<{
		isPaymentModalOpen: boolean;
		isStatusModalOpen: boolean;
		activeInvoice?: Invoice;
	}>({
		isPaymentModalOpen: false,
		isStatusModalOpen: false,
	});

	const columns: ColumnData[] = [
		{
			fieldName: 'invoice_number',
			title: 'Invoice ID',
		},
		{
			title: 'Amount',
			render: (row) => <span>{`${getCurrencySymbol(row.currency)}${row.amount_due}`}</span>,
		},
		{
			title: 'Invoice Status',

			render: (row: Invoice) => getStatusChip(row.invoice_status),
		},
		{
			title: 'Customer Slug',
			render: (row: Invoice) => <span>{row.customer?.external_id}</span>,
		},
		{
			title: 'Billing Interval',

			render: (row: Invoice) => <span>{toSentenceCase(row.billing_period || '')}</span>,
		},
		{
			title: 'Payment Status',

			render: (row: Invoice) => getPaymentStatusChip(row.payment_status),
		},
		{
			title: 'Overdue',

			render: (row: Invoice) => <span>{formatDateShort(row.due_date)}</span>,
		},
		{
			title: 'Issue Date',

			render: (row: Invoice) => <span>{formatDateShort(row.created_at)}</span>,
		},
		{
			fieldVariant: 'interactive',
			hideOnEmpty: true,
			render: (row: Invoice) => {
				const menuOptions: DropdownMenuOption[] = [
					// {
					// 	label: 'Download Invoice',
					// },
					{
						label: 'Update Invoice Status',
						onSelect: () => {
							setState({
								...state,
								isStatusModalOpen: true,
								activeInvoice: row,
							});
						},
					},
					{
						label: 'Update Payment Status',
						onSelect: () => {
							setState({
								...state,
								isPaymentModalOpen: true,
								activeInvoice: row,
							});
						},
					},
					{
						label: 'Issue a Credit Note',
						disabled: row?.payment_status === 'PENDING' || row?.payment_status === 'FAILED',
						onSelect: () => {
							navigate(`/customer-management/customers/${row?.customer_id}/invoice/${row?.id}/credit-note`);
						},
					},
					{
						label: 'View Customer',
						onSelect: () => {
							navigate(`/customer-management/customers/${row.customer_id}`);
						},
					},
					{
						label: 'View Subscription',
						onSelect() {
							navigate(`/customer-management/customers/${row.customer_id}/subscription/${row.subscription_id}`);
						},
					},
				];
				return <DropdownMenu options={menuOptions} />;
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
			<FlexpriceTable
				showEmptyRow={true}
				onRowClick={(row) => {
					navigate(`/customer-management/invoices/${row.id}`);
				}}
				columns={columns}
				data={data}
			/>
			{data.length === 0 && <p className=' text-[#64748B] text-xs font-normal font-sans mt-4'>No Invoices yet</p>}
		</div>
	);
};

export default InvoiceTable;
