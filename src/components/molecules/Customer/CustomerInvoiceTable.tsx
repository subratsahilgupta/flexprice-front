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
			render: (row) => <>{row.invoice_number || '--'}</>,
			fieldVariant: 'title',
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
