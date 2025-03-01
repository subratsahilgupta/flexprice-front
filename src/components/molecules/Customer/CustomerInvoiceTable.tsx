import { FC } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import { getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
import { ActionButton } from '@/components/atoms';
import { Invoice } from '@/models/Invoice';
import { getPaymentStatusChip } from '../InvoiceTable/InvoiceTable';

interface Props {
	data: Invoice[];
	customerId?: string;
	onRowClick?: (row: any) => void;
}

const CustomerInvoiceTable: FC<Props> = ({ data, onRowClick }) => {
	const columnData: ColumnData[] = [
		{
			title: 'Invoice Number',
			render: (row) => <span>{row.invoice_number || '--'}</span>,
		},
		{
			title: 'Status',
			render: (row) => <span>{toSentenceCase(row.invoice_status)}</span>,
		},
		{
			title: 'Payment Status',

			render: (row: Invoice) => getPaymentStatusChip(row.payment_status),
		},
		{
			title: 'Total Amount',
			render: (row) => <span>{`${getCurrencySymbol(row.currency)} ${row.amount_due}`}</span>,
		},
		{
			fieldVariant: 'interactive',
			hideOnEmpty: true,
			render: (row) => <ActionButton id={row.id} editPath={''} deleteMutationFn={async () => {}} refetchQueryKey={''} entityName={''} />,
		},
	];

	return (
		<div>
			<FlexpriceTable showEmptyRow onRowClick={onRowClick} columns={columnData} data={data ?? []} />
			{data.length === 0 && <p className=' text-[#64748B] text-xs font-normal font-sans mt-4'>No Invoices yet</p>}
		</div>
	);
};

export default CustomerInvoiceTable;
