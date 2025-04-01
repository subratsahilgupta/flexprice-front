import { Invoice } from '@/models/Invoice';
import { FC } from 'react';
import FlexpriceTable, { ColumnData, RedirectCell } from '../Table';
import { formatDateShort, getCurrencySymbol } from '@/utils/common/helper_functions';
import { Chip } from '@/components/atoms';
import { useNavigate } from 'react-router-dom';
import InvoiceTableMenu from './InvoiceTableMenu';
import { RouteNames } from '@/core/routes/Routes';
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

	const columns: ColumnData[] = [
		{
			fieldName: 'invoice_number',
			title: 'Invoice ID',
			fieldVariant: 'title',
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
			render: (row: Invoice) => (
				<RedirectCell redirectUrl={`${RouteNames.customers}/${row.customer?.id}`}>{row.customer?.external_id}</RedirectCell>
			),
		},
		// {
		// 	title: 'Billing Interval',
		// 	render: (row: Invoice) => <span>{toSentenceCase(row.billing_period || '')}</span>,
		// },
		{
			title: 'Payment Status',
			render: (row: Invoice) => getPaymentStatusChip(row.payment_status),
		},
		{
			title: 'Due Date',
			render: (row: Invoice) => <span>{formatDateShort(row.due_date)}</span>,
		},
		{
			fieldVariant: 'interactive',
			hideOnEmpty: true,
			render: (row: Invoice) => {
				return <InvoiceTableMenu data={row} />;
			},
		},
	];

	return (
		<div>
			<FlexpriceTable
				showEmptyRow={true}
				onRowClick={(row) => {
					navigate(`/customer-management/invoices/${row.id}`);
				}}
				columns={columns}
				data={data}
			/>
		</div>
	);
};

export default InvoiceTable;
