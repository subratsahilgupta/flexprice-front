import { FC } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import { getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
import { Invoice } from '@/models/Invoice';
import { getPaymentStatusChip } from './InvoiceTable';

import InvoiceTableMenu from './InvoiceTableMenu';

interface Props {
	data: Invoice[];
	customerId?: string;
	onRowClick?: (row: Invoice) => void;
}

const CustomerInvoiceTable: FC<Props> = ({ data, onRowClick }) => {
	const columnData: ColumnData<Invoice>[] = [
		{
			title: 'Invoice Number',
			render: (row) => <>{row.invoice_number || '--'}</>,
		},
		{
			title: 'Status',
			render: (row) => <>{toSentenceCase(row.invoice_status)}</>,
		},
		{
			title: 'Payment Status',

			render: (row: Invoice) => getPaymentStatusChip(row.payment_status),
		},
		{
			title: 'Total Amount',
			render: (row) => <>{`${getCurrencySymbol(row.currency)} ${row.amount_due}`}</>,
		},
		{
			fieldVariant: 'interactive',
			hideOnEmpty: true,
			render: (row) => <InvoiceTableMenu data={row} />,
		},
	];

	return (
		<div>
			<FlexpriceTable showEmptyRow onRowClick={onRowClick} columns={columnData} data={data ?? []} />
		</div>
	);
};

export default CustomerInvoiceTable;
