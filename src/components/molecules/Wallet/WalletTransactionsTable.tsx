import FlexpriceTable, { ColumnData } from '@/components/molecules/Table';
import { cn } from '@/lib/utils';
import { WalletTransaction } from '@/models/WalletTransaction';
import formatDate from '@/utils/common/format_date';
import { FC } from 'react';

const fomatAmount = (type: string, amount: number) => {
	return (
		<span className={cn(type === 'credit' ? 'text-green-500' : 'text-red-500')}>
			{type === 'credit' ? '+' : '-'}
			{amount}
			{' credits'}
		</span>
	);
};

interface Props {
	data: WalletTransaction[];
}

const columnData: ColumnData[] = [
	{
		title: 'Transactions',
		name: 'description',
	},
	{
		title: 'Date',
		name: 'created_at',
		render: (rowData) => <span>{formatDate(rowData.created_at)}</span>,
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
