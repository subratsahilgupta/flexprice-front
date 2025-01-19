import FlexpriceTable, { ColumnData } from '@/components/molecules/Table';
import { cn } from '@/lib/utils';
import { WalletTransaction } from '@/models/WalletTransaction';
import { FC } from 'react';

const formatDateShort = (dateString: string): string => {
	const date = new Date(dateString);
	const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
	return date.toLocaleDateString('en-US', options);
};

const fomatAmount = (type: string, amount: number) => {
	return (
		<span className={cn(type === 'credit' ? 'text-[#2A9D90] ' : 'text-[#18181B] ')}>
			{type === 'credit' ? '+' : '-'}
			{amount}
			{' credits'}
		</span>
	);
};
const fomatTransactionTitle = (type: string) => {
	return <span className={cn('text-[#18181B] ')}>{type === 'credit' ? 'Credits Invoiced' : 'Credits Offered'}</span>;
};

interface Props {
	data: WalletTransaction[];
}

const columnData: ColumnData[] = [
	{
		title: 'Transactions',
		name: 'description',
		render: (rowData) => fomatTransactionTitle(rowData.type),
	},
	{
		title: 'Date',
		name: 'created_at',
		render: (rowData) => <span>{formatDateShort(rowData.created_at)}</span>,
	},

	{
		title: 'Balance',
		name: 'balance',
		render: (rowData) => fomatAmount(rowData.type, rowData.amount),
	},
];

const WalletTransactionsTable: FC<Props> = ({ data }) => {
	return <FlexpriceTable columns={columnData} data={data} />;
};

export default WalletTransactionsTable;
