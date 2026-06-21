import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FlexpriceTable, { ColumnData, RedirectCell } from '../Table';
import { TaxAssociationResponse } from '@/types/dto/tax';
import { Chip, ActionButton, Button } from '@/components/atoms';
import { formatDateShort } from '@/utils/common/helper_functions';
import TaxApi from '@/api/TaxApi';
import { RouteNames } from '@/core/routes/Routes';
import { TrashIcon } from 'lucide-react';

interface Props {
	data: TaxAssociationResponse[];
	showDelete?: boolean;
	refetchQueryKey?: string;
	onRemove?: (association: TaxAssociationResponse) => void;
}

const TaxAssociationTable: FC<Props> = ({ data, showDelete = true, refetchQueryKey = 'fetchTaxAssociations', onRemove }) => {
	const { t } = useTranslation('common');

	const rows = useMemo(() => {
		const now = new Date();
		return data.filter((a) => !a.valid_to || new Date(a.valid_to) > now);
	}, [data]);

	const columns: ColumnData<TaxAssociationResponse>[] = [
		{
			title: 'Tax ID',
			render: (row) => (
				<RedirectCell redirectUrl={`${RouteNames.taxes}/${row.tax_rate_id}`}>{row.tax_rate?.name || row.tax_rate_id}</RedirectCell>
			),
		},
		{
			title: 'Priority',
			render: (row) => row.priority,
		},
		{
			title: 'Auto Apply',
			render: (row) => <Chip variant={row.auto_apply ? 'success' : 'default'} label={row.auto_apply ? t('labels.yes') : t('labels.no')} />,
		},
		{
			title: 'Valid From',
			render: (row) => (row.valid_from ? formatDateShort(row.valid_from) : '—'),
		},
		{
			title: 'Valid To',
			render: (row) => (row.valid_to ? formatDateShort(row.valid_to) : 'Forever'),
		},
		{
			fieldVariant: 'interactive',
			render(row) {
				if (onRemove) {
					return (
						<Button variant='ghost' size='sm' aria-label={t('form.remove')} onClick={() => onRemove(row)}>
							<TrashIcon className='h-4 w-4 text-destructive' />
						</Button>
					);
				}
				return (
					<ActionButton
						id={row?.id}
						deleteMutationFn={async () => {
							return await TaxApi.deleteTaxAssociation(row?.id);
						}}
						refetchQueryKey={refetchQueryKey}
						entityName={`${row?.tax_rate?.name} Tax for ${row?.entity_type}`}
						edit={{ enabled: false }}
						archive={{
							enabled: showDelete,
							icon: <TrashIcon className='h-4 w-4' />,
							text: t('actions.delete'),
						}}
					/>
				);
			},
		},
	];

	return (
		<div>
			<FlexpriceTable showEmptyRow={true} columns={columns} data={rows} />
		</div>
	);
};

export default TaxAssociationTable;
