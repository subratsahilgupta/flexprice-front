import FlexpriceTable, { ColumnData } from '@/components/molecules/Table';
import { cn } from '@/lib/utils';
import { WalletTransaction } from '@/models/WalletTransaction';
import { formatDateShort } from '@/utils/common/helper_functions';
import { FC } from 'react';

const formatAmount = (type: string, amount: number) => {
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
		render: (rowData) => fomatTransactionTitle(rowData.type),
		fieldVariant: 'title',
	},
	{
		title: 'Date',
		render: (rowData) => <span>{formatDateShort(rowData.created_at)}</span>,
	},

	{
		title: 'Balance',
		render: (rowData) => formatAmount(rowData.type, rowData.amount),
	},
];

const WalletTransactionsTable: FC<Props> = ({ data }) => {
	return <FlexpriceTable columns={columnData} data={data} />;
};

export default WalletTransactionsTable;
