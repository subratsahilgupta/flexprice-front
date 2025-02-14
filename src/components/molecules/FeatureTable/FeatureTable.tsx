import { FC } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import Feature from '@/models/Feature';
import { ActionButton, Chip } from '@/components/atoms';
import { toSentenceCase } from '@/utils/common/helper_functions';
import formatChips from '@/utils/common/format_chips';
import formatDate from '@/utils/common/format_date';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '@/core/routes/Routes';
import FeatureApi from '@/utils/api_requests/FeatureApi';

interface Props {
	data: Feature[];
	showEmptyRow?: boolean;
	emptyRowMessage?: string;
}

const getFeatureTypeChips = (type: string) => {
	switch (type.toLocaleLowerCase()) {
		case 'static':
			return <Chip isActive={false} label={toSentenceCase(type)} />;
		case 'metered':
			return <Chip activeBgColor='#F0F9FF' activeTextColor='#1E3A8A' isActive={true} label={toSentenceCase(type)} />;
		case 'boolean':
			return <Chip activeBgColor='#F0F9FF' activeTextColor='#075985' isActive={true} label={toSentenceCase(type)} />;
		default:
			return <Chip activeBgColor='#F0F9FF' activeTextColor='#075985' isActive={true} label={toSentenceCase(type)} />;
	}
};

const FeatureTable: FC<Props> = ({ data, emptyRowMessage, showEmptyRow }) => {
	const navigate = useNavigate();

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
				return getFeatureTypeChips(row.type);
			},
		},
		{
			fieldName: 'meter_id',
			title: 'Linked Billable Metric ',
			onCLick(row) {
				if (row.meter_id) {
					navigate(RouteNames.editMeter + `?id=${row.meter_id}`);
				}
			},
			render(row) {
				return row.meter ? row.meter.name : '--';
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
			render(row) {
				return (
					<ActionButton
						deleteMutationFn={async () => {
							return await FeatureApi.deleteFeature(row.id);
						}}
						id={row.id}
						editPath={''}
						isEditDisabled={true}
						isArchiveDisabled={row.status === 'archived'}
						refetchQueryKey={'fetchFeatures'}
						entityName={row.name}
					/>
				);
			},
		},
	];

	return (
		<div>
			<FlexpriceTable data={data} columns={columnData} showEmptyRow={showEmptyRow} emptyRowText={emptyRowMessage} />
		</div>
	);
};

export default FeatureTable;
