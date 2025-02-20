import { FC } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import { getCurrencySymbol, toSentenceCase } from '@/utils/common/helper_functions';
import { ActionButton, Chip } from '@/components/atoms';
import { Invoice } from '@/models/Invoice';

const formatPaymentStatus = (status: string) => {
	switch (status.toUpperCase()) {
		case 'PENDING':
			return 'Pending';
		case 'SUCCEEDED':
			return 'Successful';
		case 'FAILED':
			return 'Unsuccessful';
		default:
			return 'Unsuccessful';
	}
};

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
			render: (row) => <Chip isActive={row.payment_status === 'SUCCEEDED'} label={formatPaymentStatus(row.payment_status)} />,
			align: 'center',
		},
		{
			title: 'Total Amount',
			render: (row) => <span>{`${getCurrencySymbol(row.currency)} ${row.amount_due}`}</span>,
			align: 'center',
		},
		{
			title: '',
			render: (row) => <ActionButton id={row.id} editPath={''} deleteMutationFn={async () => {}} refetchQueryKey={''} entityName={''} />,
		},
	];

	return (
		<div>
			<FlexpriceTable emptyRowText='No Invoices yet' showEmptyRow onRowClick={onRowClick} columns={columnData} data={data ?? []} />
			{data.length === 0 && <p className=' text-[#64748B] text-xs font-normal font-sans mt-4'>No Invoices yet</p>}
		</div>
	);
};

export default CustomerInvoiceTable;
