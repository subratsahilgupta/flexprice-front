import { Chip, Progress } from '@/components/atoms';
import { ColumnData, FlexpriceTable, RedirectCell } from '@/components/molecules';
import { RouteNames } from '@/core/routes/Routes';
import { FEATURE_TYPE } from '@/models/Feature';
import { FC } from 'react';
import { getFeatureIcon } from '@/components/atoms/SelectFeature/SelectFeature';
import CustomerUsage from '@/models/CustomerUsage';
import { formatAmount } from '@/components/atoms/Input/Input';

interface Props {
	data: CustomerUsage[];
	allowRedirect?: boolean;
}

export const getFeatureTypeChips = ({
	type,
	showIcon = false,
	showLabel = false,
}: {
	type: string;
	showIcon?: boolean;
	showLabel?: boolean;
}) => {
	const icon = getFeatureIcon(type);
	switch (type.toLocaleLowerCase()) {
		case FEATURE_TYPE.STATIC: {
			return <Chip variant='default' icon={showIcon && icon} label={showLabel && 'Static'} />;
		}
		case FEATURE_TYPE.METERED:
			return <Chip textColor='#1E3A8A' bgColor='#F0F9FF' icon={showIcon && icon} label={showLabel && 'Metered'} />;
		case FEATURE_TYPE.BOOLEAN:
			return <Chip textColor='#075985' bgColor='#F0F9FF' icon={showIcon && icon} label={showLabel && 'Boolean'} />;
		default:
			return <Chip textColor='#075985' bgColor='#F0F9FF' icon={showIcon && icon} label={showLabel && '--'} />;
	}
};

const getFeatureValue = (data: CustomerUsage) => {
	switch (data.feature.type) {
		case FEATURE_TYPE.STATIC:
			return data.sources?.[0]?.static_value || '--';
		case FEATURE_TYPE.METERED:
			return (
				<span className='flex items-end gap-1'>
					{data.total_limit ? formatAmount(data.total_limit?.toString()) : 'Unlimited'}
					<span className='text-[#64748B] text-sm font-normal font-sans'>units</span>
				</span>
			);
		case FEATURE_TYPE.BOOLEAN:
			return data.is_enabled ? 'True' : 'False';
		default:
			return '--';
	}
};

const CustomerUsageTable: FC<Props> = ({ data, allowRedirect = true }) => {
	const columnData: ColumnData<CustomerUsage>[] = [
		{
			title: 'Feature',

			render(row) {
				return (
					<RedirectCell allowRedirect={allowRedirect} redirectUrl={`${RouteNames.featureDetails}/${row?.feature?.id}`}>
						{getFeatureTypeChips({
							type: row?.feature?.type || '',
							showIcon: true,
						})}
						{row?.feature?.name}
					</RedirectCell>
				);
			},
		},
		{
			title: 'Plan',
			render(row) {
				return (
					<RedirectCell allowRedirect={allowRedirect} redirectUrl={`${RouteNames.plan}/${row?.sources[0]?.plan_id}`}>
						{row?.sources[0]?.plan_name}
					</RedirectCell>
				);
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
				if (row?.feature?.type != FEATURE_TYPE.METERED) {
					return '--';
				}
				const usage = Number(row?.current_usage);
				const limit = Number(row?.total_limit);

				// Handle unlimited case (limit is 0 or null)
				if (!limit) {
					return (
						<Progress
							label={`${formatAmount(usage.toString())} / Unlimited`}
							value={0}
							className='h-[6px]'
							indicatorColor='bg-blue-600'
							backgroundColor='bg-blue-200'
						/>
					);
				}

				// Handle case with limit
				const value = Math.ceil((usage / limit) * 100);
				const indicatorColor = value >= 100 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-[#6167d9] to-[#2563eb]';

				const backgroundColor = value >= 100 ? 'bg-red-50' : 'bg-blue-200';

				return (
					<Progress
						label={`${formatAmount(usage.toString())} / ${formatAmount(limit.toString())}`}
						value={value}
						className='h-[6px]'
						indicatorColor={indicatorColor}
						backgroundColor={backgroundColor}
					/>
				);
			},
		},
	];

	return (
		<div>
			<FlexpriceTable showEmptyRow data={data} columns={columnData} variant='no-bordered' />
		</div>
	);
};

export default CustomerUsageTable;
