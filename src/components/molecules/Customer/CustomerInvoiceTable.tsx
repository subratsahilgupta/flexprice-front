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
			fieldName: 'invoice_number',
			title: 'Invoice Number',
			render: (row) => <span>{row.invoice_number || '--'}</span>,
		},
		{
			fieldName: 'id',
			title: 'Status',
			render: (row) => <span>{toSentenceCase(row.invoice_status)}</span>,
		},
		{
			fieldName: 'id',
			title: 'Payment Status',
			render: (row) => <Chip isActive={row.payment_status === 'SUCCEEDED'} label={formatPaymentStatus(row.payment_status)} />,
			align: 'center',
		},
		{
			fieldName: 'Amount',
			title: 'Total Amount',
			render: (row) => <span>{`${getCurrencySymbol(row.currency)} ${row.amount_due}`}</span>,
			align: 'center',
		},
		{
			fieldName: 'id',
			title: '',
			render: (row) => <ActionButton id={row.id} editPath={''} deleteMutationFn={async () => {}} refetchQueryKey={''} entityName={''} />,
		},
	];

	return <FlexpriceTable onRowClick={onRowClick} columns={columnData} data={data ?? []} />;
};

export default CustomerInvoiceTable;
