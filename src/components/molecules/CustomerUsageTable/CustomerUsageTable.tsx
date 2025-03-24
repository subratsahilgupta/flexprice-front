import { Chip, Progress } from '@/components/atoms';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import { RouteNames } from '@/core/routes/Routes';
import { FeatureType } from '@/models/Feature';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { getFeatureIcon } from '@/components/atoms/SelectFeature/SelectFeature';
import { CustomerEntitlement } from '@/models/CustomerEntitlement';
import CustomerUsage from '@/models/CustomerUsage';

interface Props {
	data: CustomerUsage[];
}

const getFeatureTypeChips = (type: string) => {
	const icon = getFeatureIcon(type);
	switch (type.toLocaleLowerCase()) {
		case 'static': {
			return <Chip variant='default' label={icon} />;
		}
		case 'metered':
			return <Chip textColor='#1E3A8A' bgColor='#F0F9FF' label={icon} />;
		case 'boolean':
			return <Chip textColor='#075985' bgColor='#F0F9FF' label={icon} />;
		default:
			return <Chip textColor='#075985' bgColor='#F0F9FF' label={icon} />;
	}
};

const getFeatureValue = (data: CustomerEntitlement) => {
	switch (data.feature.type) {
		case FeatureType.static:
			return data.entitlement.static_values[0];
		case FeatureType.metered:
			return (
				<span className='flex items-end gap-1'>
					{data.entitlement.usage_limit ?? 'Unlimited'}
					<span className='text-[#64748B] text-sm font-normal font-sans'>units</span>
				</span>
			);
		case FeatureType.boolean:
			return data.entitlement.is_enabled ? 'True' : 'False';
		default:
			return '--';
	}
};

const columnData: ColumnData<CustomerEntitlement>[] = [
	{
		title: 'Feature',
		fieldVariant: 'title',
		render(row) {
			return (
				<Link className='inline-flex gap-2 items-center' to={RouteNames.featureDetails + `/${row?.feature?.id}`}>
					{getFeatureTypeChips(row?.feature?.type || '')}
					{row?.feature?.name}
				</Link>
			);
		},
	},
	{
		title: 'Source	',
		render(row) {
			return <span>{row?.sources[0]?.plan_name}</span>;
		},
	},
	{
		title: 'Value',
		render(row) {
			return getFeatureValue(row);
		},
	},
	{
		title: 'Usage',
		render(row) {
			if (row?.feature?.type != FeatureType.metered) {
				return '--';
			}
			const usage = Number(row?.entitlement?.usage_limit);
			const limit = Number(row?.entitlement?.usage_limit);
			const value = Math.ceil((usage / limit) * 100);
			// const resetLabel = row.usage_reset_period ? `Resets ${formatBillingPeriod(row.usage_reset_period)}` : '';

			const indicatorColor = value >= 100 ? 'bg-red-600' : 'bg-green-800';
			const backgroundColor = value >= 100 ? 'bg-red-50' : 'bg-green-50';

			const label = row.entitlement.usage_reset_period ? `${usage} / ${limit}` : `${usage} / No Limit`;
			return <Progress label={label} value={value} className='h-[6px]' indicatorColor={indicatorColor} backgroundColor={backgroundColor} />;
		},
	},
];

const CustomerUsageTable: FC<Props> = ({ data }) => {
	return (
		<div>
			<FlexpriceTable showEmptyRow data={data} columns={columnData} />
			{(data?.length || 0) === 0 && <p className='text-[#64748B] text-xs font-normal font-sans mt-4'>No Entitlements added</p>}
		</div>
	);
};

export default CustomerUsageTable;
