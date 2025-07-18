import { FC } from 'react';
import FlexpriceTable, { ColumnData } from '../Table';
import { TaxRateResponse } from '@/types/dto/tax';
import { Chip } from '@/components/atoms';
import { formatDateShort } from '@/utils/common/helper_functions';
import { TAX_RATE_TYPE, TAX_RATE_STATUS, TAX_RATE_SCOPE } from '@/models/Tax';

interface Props {
	data: TaxRateResponse[];
	onRowClick?: (tax: TaxRateResponse) => void;
}

const getTaxTypeLabel = (type: TAX_RATE_TYPE) => {
	switch (type) {
		case TAX_RATE_TYPE.PERCENTAGE:
			return 'Percentage';
		case TAX_RATE_TYPE.FIXED:
			return 'Fixed Amount';
		default:
			return 'Unknown';
	}
};

const getStatusChip = (status: TAX_RATE_STATUS) => {
	const statusConfig = {
		[TAX_RATE_STATUS.ACTIVE]: { label: 'Active', variant: 'success' as const },
		[TAX_RATE_STATUS.INACTIVE]: { label: 'Inactive', variant: 'default' as const },
		[TAX_RATE_STATUS.DELETED]: { label: 'Deleted', variant: 'failed' as const },
	};
	console.log(status);
	const config = statusConfig[status] || { label: 'Unknown', variant: 'default' as const };
	return <Chip label={config.label} variant={config.variant} />;
};

const getScopeLabel = (scope: TAX_RATE_SCOPE) => {
	switch (scope) {
		case TAX_RATE_SCOPE.INTERNAL:
			return 'Internal';
		case TAX_RATE_SCOPE.EXTERNAL:
			return 'External';
		case TAX_RATE_SCOPE.ONETIME:
			return 'One-time';
		default:
			return 'Unknown';
	}
};

const formatTaxValue = (tax: TaxRateResponse) => {
	if (tax.tax_rate_type === TAX_RATE_TYPE.PERCENTAGE && tax.percentage_value !== undefined) {
		return `${tax.percentage_value}%`;
	}
	if (tax.tax_rate_type === TAX_RATE_TYPE.FIXED && tax.fixed_value !== undefined) {
		return `${tax.fixed_value}`;
	}
	return '--';
};

const TaxTable: FC<Props> = ({ data, onRowClick }) => {
	const columns: ColumnData<TaxRateResponse>[] = [
		{
			title: 'Name',
			render: (row) => (
				<div className='flex items-center gap-2'>
					<span className='font-medium'>{row.name}</span>
				</div>
			),
		},
		{
			title: 'Code',
			render: (row) => <span className='font-mono text-sm bg-gray-100 px-2 py-1 rounded'>{row.code}</span>,
		},
		{
			title: 'Type',
			render: (row) => getTaxTypeLabel(row.tax_rate_type),
		},
		{
			title: 'Value',
			render: (row) => formatTaxValue(row),
		},
		{
			title: 'Scope',
			render: (row) => getScopeLabel(row.scope),
		},
		{
			title: 'Status',
			render: (row) => getStatusChip(row.tax_rate_status),
		},
		{
			title: 'Created',
			render: (row) => formatDateShort(row.created_at),
		},
	];

	return (
		<div>
			<FlexpriceTable showEmptyRow={true} onRowClick={onRowClick} columns={columns} data={data} />
		</div>
	);
};

export default TaxTable;
