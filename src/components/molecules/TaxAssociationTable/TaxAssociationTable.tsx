import { FC } from 'react';
import FlexpriceTable, { ColumnData, TooltipCell } from '../Table';
import { TaxAssociationResponse } from '@/types/dto/tax';
import { Chip, ActionButton } from '@/components/atoms';
import { formatDateShort } from '@/utils/common/helper_functions';
import TaxApi from '@/api/TaxApi';
import formatChips from '@/utils/common/format_chips';

interface Props {
	data: TaxAssociationResponse[];
	onEdit?: (taxAssociation: TaxAssociationResponse) => void;
}

const TaxAssociationTable: FC<Props> = ({ data, onEdit }) => {
	const columns: ColumnData<TaxAssociationResponse>[] = [
		{
			title: 'Entity Type',
			render: (row) => <TooltipCell tooltipContent={row.entity_type} tooltipText={row.entity_type} />,
		},
		{
			title: 'Entity ID',
			render: (row) => row.entity_id,
		},
		{
			title: 'Priority',
			render: (row) => row.priority,
		},
		{
			title: 'Auto Apply',
			render: (row) => <Chip variant={row.auto_apply ? 'success' : 'default'} label={row.auto_apply ? 'Yes' : 'No'} />,
		},
		{
			title: 'Currency',
			render: (row) => row.currency,
		},
		{
			title: 'Status',
			render: (row) => {
				const label = formatChips(row?.status);
				return <Chip variant={label === 'Active' ? 'success' : 'default'} label={label} />;
			},
		},
		{
			title: 'Created',
			render: (row) => formatDateShort(row.created_at),
		},
		{
			fieldVariant: 'interactive',
			render(row) {
				return (
					<ActionButton
						deleteMutationFn={async () => {
							return await TaxApi.deleteTaxAssociation(row?.id);
						}}
						id={row?.id}
						editPath={''}
						isEditDisabled={false}
						isArchiveDisabled={false}
						refetchQueryKey={'fetchTaxAssociations'}
						entityName={`Tax Association ${row?.id}`}
						onEdit={() => onEdit?.(row)}
					/>
				);
			},
		},
	];

	return (
		<div>
			<FlexpriceTable showEmptyRow={true} columns={columns} data={data} />
		</div>
	);
};

export default TaxAssociationTable;
