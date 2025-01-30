import { Invoice } from '@/models/Invoice';
import { FC, useState } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import { formatBillingPeriod, formatDateShort, getCurrencySymbol } from '@/utils/common/helper_functions';
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
			return <Chip isActive={false} label='Void' />;
		case 'FINALIZED':
			return <Chip isActive={true} label='Paid' />;
		case 'DRAFT':
			return <Chip activeBgColor='#F0F2F5' activeTextColor='#57646E' isActive={false} label='Draft' />;
		default:
			return <Chip isActive={false} activeBgColor='#F0F2F5' activeTextColor='#57646E' label='Draft' />;
	}
};

const getPaymentStatusChip = (status: string) => {
	switch (status.toUpperCase()) {
		case 'PENDING':
			return <Chip isActive={false} label='Pending' />;
		case 'SUCCEEDED':
			return <Chip isActive={true} label='Successful' />;
		case 'FAILED':
			return <Chip isActive={true} activeTextColor='#DC2626' activeBgColor='#FEE2E2' label='Failed' />;
		default:
			return <Chip isActive={false} label='Unknown' />;
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
			fieldName: 'invoice_number',
			render: (row) => <span>{`${getCurrencySymbol(row.currency)}${row.amount_due}`}</span>,
		},
		{
			title: 'Invoice Status',
			fieldName: '',
			align: 'center',
			render: (row: Invoice) => getStatusChip(row.invoice_status),
		},
		{
			title: 'Customer ID',
			fieldName: 'customer_id',
		},
		{
			title: 'Billing Interval',
			fieldName: '',
			align: 'center',
			render: (row: Invoice) => <span>{formatBillingPeriod(row.billing_period || '')}</span>,
		},
		{
			title: 'Payment Status',
			fieldName: '',
			align: 'center',
			render: (row: Invoice) => getPaymentStatusChip(row.payment_status),
		},
		{
			title: 'Overdue',
			fieldName: '',
			align: 'center',
			render: (row: Invoice) => <span>{formatDateShort(row.due_date)}</span>,
		},
		{
			title: 'Issue Date',
			fieldName: '',
			align: 'center',
			render: (row: Invoice) => <span>{formatDateShort(row.created_at)}</span>,
		},
		{
			title: '',
			fieldName: '',
			redirect: false,
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
			<FlexpriceTable redirectUrl='/customer-management/invoices/' columns={columns} data={data} />
		</div>
	);
};

export default InvoiceTable;
