import { Payment } from '@/models/Payment';
import FlexpriceTable, { ColumnData, TooltipCell } from '../Table';
import { formatDateShort } from '@/utils/common/helper_functions';
import { Chip } from '@/components/atoms';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { getCurrencySymbol } from '@/utils/common/helper_functions';

interface Props {
	data: Payment[];
}

const columns: ColumnData<Payment>[] = [
	{
		title: 'ID',
		width: 200,
		render(rowData) {
			return <TooltipCell tooltipContent={rowData.id} tooltipText={rowData.id} />;
		},
	},
	{
		title: 'Date',
		render: (payment) => formatDateShort(payment.created_at),
	},
	{
		title: 'Status',
		render: (payment) => (
			<Chip
				label={toSentenceCase(payment.payment_status)}
				variant={payment.payment_status.toLowerCase() === 'succeeded' ? 'success' : 'failed'}
			/>
		),
	},
	{
		title: 'Amount',
		render: (payment) => `${getCurrencySymbol(payment.currency)} ${payment.amount}`,
	},
];
const InvoicePaymentsTable = ({ data }: Props) => {
	return (
		<div>
			<FlexpriceTable showEmptyRow columns={columns} data={data} />
		</div>
	);
};

export default InvoicePaymentsTable;
