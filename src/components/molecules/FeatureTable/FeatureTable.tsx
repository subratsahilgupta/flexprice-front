import { FC } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import Feature from '@/models/Feature';
import { Chip } from '@/components/atoms';
import { toSentenceCase } from '@/utils/common/helper_functions';
import formatChips from '@/utils/common/format_chips';
import formatDate from '@/utils/common/format_date';
import DropdownMenu from '../DropdownMenu';

interface Props {
	data: Feature[];
}

const columnData: ColumnData<Feature>[] = [
	{
		fieldName: 'name',
		title: 'Feature Name',
	},
	{
		fieldName: 'type',
		title: 'Type',
		align: 'center',
		render(row) {
			return (
				<>
					<Chip activeBgColor='#F0F9FF' activeTextColor='#075985' isActive={row.type != 'static'} label={toSentenceCase(row.type)} />
				</>
			);
		},
	},
	{
		fieldName: 'meter_id',
		title: 'Linked Billable Metric ',
		render(row) {
			return row.meter_id ? row.meter_id : '--';
		},
	},
	{
		fieldName: 'status',
		title: 'Status',
		align: 'center',
		render: (row) => {
			const label = formatChips(row.status);
			return <Chip isActive={label === 'Active'} label={label} />;
		},
	},
	{
		fieldName: 'description',
		title: 'Mapped with plan',
		render: () => {
			return '--';
		},
	},
	{
		fieldName: 'updated_at',
		title: 'Updated At',
		render: (row) => {
			return formatDate(row.updated_at);
		},
	},
	{
		fieldName: 'id',
		title: '',
		render() {
			return <DropdownMenu options={[]} />;
		},
	},
];

const FeatureTable: FC<Props> = ({ data }) => {
	return (
		<div>
			<FlexpriceTable data={data} columns={columnData} />
		</div>
	);
};

export default FeatureTable;
