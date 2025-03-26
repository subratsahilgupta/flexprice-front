import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import FeatureApi from '@/utils/api_requests/FeatureApi';
import { Chip, Loader, Page, SectionHeader, Spacer, Divider, Card, CardHeader, NoDataCard } from '@/components/atoms';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import { RouteNames } from '@/core/routes/Routes';
import { ApiDocsContent, ColumnData, FlexpriceTable, RedirectCell } from '@/components/molecules';
import EntitlementApi, { ExtendedEntitlement } from '@/utils/api_requests/EntitlementApi';
import formatChips from '@/utils/common/format_chips';
import { FeatureType } from '@/models/Feature';
import { getFeatureTypeChips } from '@/components/molecules/FeatureTable/FeatureTable';
import { formatAggregationType } from './AddFeature';

// const getFeatureType = (type: string) => {
// 	const className = 'items-center justify-end text-sm font-normal text-gray-800 flex gap-2';
// 	switch (type) {
// 		case 'boolean':
// 			return (
// 				<span className={className}>
// 					<SquareCheckBig className='w-4 h-4' />
// 					Boolean
// 				</span>
// 			);
// 		case 'metered':
// 			return (
// 				<span className={className}>
// 					<Gauge className='w-4 h-4' />
// 					Metered
// 				</span>
// 			);
// 		case 'static':
// 			return (
// 				<span className={className}>
// 					<Wrench className='w-4 h-4' />
// 					Static
// 				</span>
// 			);
// 		default:
// 			return '--';
// 	}
// };
// const getStatusChip = (status: string) => {
// 	switch (status.toUpperCase()) {
// 		case 'PUBLISHED':
// 			return <Chip variant='success' label='Active' />;
// 		case 'ARCHIVED':
// 			return <Chip variant='default' label='Archived' />;
// 		case 'DELETED':
// 			return <Chip variant='failed' label='Deleted' />;
// 		default:
// 			return <Chip variant='default' label='Draft' />;
// 	}
// };

const formatUsageReset = (usageReset: string) => {
	switch (usageReset) {
		case 'RESET_PERIOD':
			return 'Periodic';
		case 'NEVER':
			return 'Cumulative';
		default:
			return usageReset;
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

	const columns: ColumnData<ExtendedEntitlement>[] = [
		{
			title: 'Plan',
			render: (rowData: ExtendedEntitlement) => {
				return <RedirectCell redirectUrl={`${RouteNames.plan}/${rowData?.plan?.id}`}>{rowData?.plan?.name}</RedirectCell>;
			},
			fieldVariant: 'title',
			width: '40%',
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
					return rowData.is_enabled ? 'Yes' : 'No';
				}
				if (rowData.feature_type === FeatureType.static) {
					return rowData.static_value || '0';
				}
				if (rowData.feature_type === FeatureType.metered) {
					const usageLimit = rowData.usage_limit ?? 'Unlimited';
					const unitPlural =
						rowData.usage_limit === null || rowData.usage_limit > 1
							? rowData.feature.unit_plural || 'units'
							: rowData.feature.unit_singular || 'unit';
					return (
						<span className='text-right'>
							{usageLimit}
							<span className='text-muted-foreground text-sm font-sans ml-2'>{unitPlural}</span>
						</span>
					);
				}
				return <span className=''>--</span>;
			},
		},
	];

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error fetching feature details');
	}
	return (
		<Page
			header={
				<SectionHeader
					title={
						<>
							{data?.name}
							<span className='ml-2 text-sm'>{getFeatureTypeChips(data?.type || '', true)}</span>
						</>
					}>
					{/* <div className='flex gap-2'>
					<Button disabled variant={'outline'} className='flex gap-2'>
						<EyeOff />
						Archive
					</Button>
					<Button disabled className='flex gap-2'>
						<Pencil />
						Edit
					</Button>
				</div> */}
				</SectionHeader>
			}>
			<ApiDocsContent tags={['Features']} />

			<Spacer className='!h-4' />
			<div className='space-y-6'>
				{(linkedEntitlements?.items?.length || 0) > 0 ? (
					<Card variant='notched'>
						<CardHeader title='Linked Plans' />
						<FlexpriceTable showEmptyRow columns={columns} data={linkedEntitlements?.items ?? []} />
					</Card>
				) : (
					<NoDataCard title='Linked Plans' subtitle='No plans linked to the feature yet' />
				)}
				{data?.type === FeatureType.metered && (
					<Card variant='notched'>
						<div className='!space-y-6'>
							<CardHeader title='Event Details' className='!p-0 !mb-2' />
							<div>
								<div className='grid grid-cols-[200px_1fr] items-center'>
									<span className='text-gray-500 text-sm'>Event Name</span>
									<span className='text-gray-800 text-sm'>{data?.meter?.event_name}</span>
								</div>
							</div>

							<Divider />

							{data?.meter?.filters?.length > 0 && (
								<>
									<div className='space-y-4'>
										<span className='text-gray-500 text-sm font-medium block'>Event Filters</span>
										<div className='space-y-3'>
											{data?.meter?.filters?.map((filter) => {
												return (
													<div className='grid grid-cols-[200px_1fr] items-start'>
														<span className='text-gray-800 text-sm'>{filter.key}</span>
														<div className='flex gap-1.5 flex-wrap'>
															{filter.values.map((value) => {
																return <Chip className='text-xs py-0.5' variant='default' label={value} />;
															})}
														</div>
													</div>
												);
											})}
										</div>
									</div>
									<Divider />
								</>
							)}

							<div className='space-y-4'>
								<span className='text-gray-500 text-sm font-medium block'>Aggregation Details</span>
								<div className='space-y-3'>
									{/* <div className='grid grid-cols-[200px_1fr] items-center'>
										<span className='text-gray-500 text-sm'>Aggregation</span>
										<span className='text-gray-800 text-sm'>{toSentenceCase(data?.meter?.aggregation.type || '--')}</span>
									</div> */}
									<div className='grid grid-cols-[200px_1fr] items-center'>
										<span className='text-gray-500 text-sm'>Type</span>
										<span className='text-gray-800 text-sm'>{formatAggregationType(data?.meter?.aggregation.type || '--')}</span>
									</div>
									<div className='grid grid-cols-[200px_1fr] items-center'>
										<span className='text-gray-500 text-sm'>Value</span>
										<span className='text-gray-800 text-sm'>{data?.meter?.aggregation.field || '--'}</span>
									</div>

									<div className='grid grid-cols-[200px_1fr] items-center'>
										<span className='text-gray-500 text-sm'>Unit Name</span>
										<span className='text-gray-800 text-sm'>{`${data.unit_singular || 'unit'} / ${data.unit_plural || 'units'}`}</span>
									</div>
									<div className='grid grid-cols-[200px_1fr] items-center'>
										<span className='text-gray-500 text-sm'>Usage Reset </span>
										<span className='text-gray-800 text-sm'>{formatUsageReset(data?.meter?.reset_usage || '--')}</span>
									</div>
								</div>
							</div>
						</div>
					</Card>
				)}
			</div>
		</Page>
	);
};

export default FeatureDetails;
