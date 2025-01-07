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
}

const columnData: ColumnData[] = [
	{
		name: 'id',
		title: 'Invoice Number',
	},
	{
		name: 'id',
		title: 'Status',
		render: (row) => <span>{toSentenceCase(row.invoice_status)}</span>,
	},
	{
		name: 'id',
		title: 'Payment Status',
		render: (row) => <Chip isActive={row.payment_status === 'SUCCEEDED'} label={formatPaymentStatus(row.payment_status)} />,
	},
	{
		name: 'Amount',
		title: 'Total Amount',
		render: (row) => <span>{`${getCurrencySymbol(row.currency)} ${row.amount_paid}`}</span>,
	},
	{
		name: 'id',
		title: '',
		render: (row) => <ActionButton id={row.id} editPath={''} deleteMutationFn={async () => {}} refetchQueryKey={''} entityName={''} />,
	},
];

const CustomerInvoiceTable: FC<Props> = ({ data }) => {
	return <FlexpriceTable columns={columnData} data={data ?? []} />;
};

export default CustomerInvoiceTable;
