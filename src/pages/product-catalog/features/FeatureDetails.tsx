import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import FeatureApi from '@/utils/api_requests/FeatureApi';
import { Button, Chip, FormHeader, Loader, SectionHeader, Spacer } from '@/components/atoms';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import { RouteNames } from '@/core/routes/Routes';
import { Pencil, EyeOff, SquareCheckBig, Gauge, Wrench } from 'lucide-react';
import { ColumnData, Detail, DetailsCard, FlexpriceTable } from '@/components/molecules';
import formatDate from '@/utils/common/format_date';
import EntitlementApi, { ExtendedEntitlement } from '@/utils/api_requests/EntitlementApi';
import formatChips from '@/utils/common/format_chips';
import { FeatureType } from '@/models/Feature';

const getFeatureType = (type: string) => {
	const className = 'items-center justify-end text-sm font-normal text-gray-800 flex gap-2';
	switch (type) {
		case 'boolean':
			return (
				<span className={className}>
					<SquareCheckBig className='w-4 h-4' />
					Boolean
				</span>
			);
		case 'metered':
			return (
				<span className={className}>
					<Gauge className='w-4 h-4' />
					Metered
				</span>
			);
		case 'static':
			return (
				<span className={className}>
					<Wrench className='w-4 h-4' />
					Static
				</span>
			);
		default:
			return '--';
	}
};
const getStatusChip = (status: string) => {
	switch (status.toUpperCase()) {
		case 'PUBLISHED':
			return <Chip variant='success' label='Active' />;
		case 'ARCHIVED':
			return <Chip variant='default' label='Archived' />;
		case 'DELETED':
			return <Chip variant='failed' label='Deleted' />;
		default:
			return <Chip variant='default' label='Draft' />;
	}
};

const FeatureDetails = () => {
	const { id: featureId } = useParams() as { id: string };
	const { updateBreadcrumb } = useBreadcrumbsStore();

	const { data, isLoading, isError } = useQuery({
		queryKey: ['fetchFeatureDetails', featureId],
		queryFn: async () => await FeatureApi.getFeatureById(featureId!),
		enabled: !!featureId,
	});

	const { data: linkedEntitlements } = useQuery({
		queryKey: ['fetchLinkedEntitlements', featureId],
		queryFn: async () =>
			await EntitlementApi.getAllEntitlements({
				feature_ids: [featureId!],
				expand: 'plans,features',
			}),
		enabled: !!featureId,
	});

	useEffect(() => {
		updateBreadcrumb(1, 'Features', RouteNames.features);
		if (data?.name) {
			updateBreadcrumb(2, data?.name, RouteNames.featureDetails + featureId);
		}
	}, [data, featureId, updateBreadcrumb]);

	console.log(linkedEntitlements);

	const columns: ColumnData<ExtendedEntitlement>[] = [
		{
			title: 'Plan',
			render: (rowData: ExtendedEntitlement) => {
				return <span className='text-gray-800'>{rowData?.plan?.name}</span>;
			},
		},
		{
			title: 'Status',

			render: (rowData: ExtendedEntitlement) => {
				const label = formatChips(rowData.plan.status);
				return <Chip variant={label === 'Active' ? 'success' : 'default'} label={label} />;
			},
		},
		{
			title: 'Value',
			align: 'right',
			render: (rowData: ExtendedEntitlement) => {
				if (rowData.feature_type === FeatureType.boolean) {
					return <span className='text-gray-800'>{rowData.is_enabled ? 'Yes' : 'No'}</span>;
				}
				if (rowData.feature_type === FeatureType.static) {
					return <span className='text-gray-800 text-right'>{rowData.static_value || '0'}</span>;
				}
				if (rowData.feature_type === FeatureType.metered) {
					const usageLimit = rowData.usage_limit ?? 'Unlimited';
					const unitPlural =
						rowData.usage_limit || 0 > 1 ? rowData.feature.unit_plural || 'units' : rowData.feature.unit_singular || 'unit';
					return (
						<span className='text-gray-800 text-right'>
							{usageLimit}
							<span className='text-muted-foreground text-xs font-sans ml-2'>{unitPlural}</span>
						</span>
					);
				}
				return <span className='text-gray-800'>--</span>;
			},
		},
	];

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching feature details');
	}

	const featureBasicInfo: Detail[] = [
		{ label: 'Name', value: data?.name },
		{ label: 'Description', value: data?.description },
		{ label: 'Type', value: getFeatureType(data?.type || '') },
		{ label: 'Status', value: getStatusChip(data?.status || '') },
		{ label: 'Created Date', value: data?.created_at ? formatDate(data?.created_at) : '--' },
	];

	const additionalDetails: Detail[] = [
		{ label: 'Linked Feature', value: data?.meter?.name },
		{
			variant: 'divider' as const,
			className: 'w-full',
		},
		{
			variant: 'heading',
			label: 'Unit Name',
		},
		{ label: 'Singular', value: data?.unit_singular || 'unit' },
		{ label: 'Plural', value: data?.unit_plural || 'units' },
	];

	return (
		<div className='page w-2/3'>
			<SectionHeader title={data?.name || ''}>
				<div className='flex gap-2'>
					<Button disabled variant={'outline'} className='flex gap-2'>
						<EyeOff />
						Archive
					</Button>
					<Button disabled className='flex gap-2'>
						<Pencil />
						Edit
					</Button>
				</div>
			</SectionHeader>

			<Spacer className='!h-4' />
			<div className='space-y-4'>
				<DetailsCard title='Feature Details' data={featureBasicInfo} />

				{data?.type === FeatureType.metered && <DetailsCard title='Additional Details' data={additionalDetails} />}
				<div className='card'>
					<FormHeader variant='sub-header' title='Linked Plans' />
					<FlexpriceTable showEmptyRow columns={columns} data={linkedEntitlements?.items ?? []} />
				</div>
			</div>
		</div>
	);
};

export default FeatureDetails;
