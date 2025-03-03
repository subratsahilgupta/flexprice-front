import { ActionButton, FormHeader, Loader, Page, SectionHeader } from '@/components/atoms';
import { AddEntitlementDrawer, ColumnData, FlexpriceTable } from '@/components/molecules';
import { DetailsCard } from '@/components/molecules';
import { getFeatureTypeChips } from '@/components/molecules/FeatureTable/FeatureTable';
import { RouteNames } from '@/core/routes/Routes';
import { Price } from '@/models/Price';
import { FeatureType } from '@/models/Feature';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import EntitlementApi, { ExtendedEntitlement } from '@/utils/api_requests/EntitlementApi';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import formatDate from '@/utils/common/format_date';
import { formatPriceType, toSentenceCase } from '@/utils/common/helper_functions';
import { getPriceTableCharge } from '@/utils/models/transformed_plan';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

type Params = {
	planId: string;
};

const formatInvoiceCadence = (cadence: string): string => {
	switch (cadence.toUpperCase()) {
		case 'ADVANCE':
			return 'Advance';
		case 'ARREAR':
			return 'Arrear';
		default:
			return '';
	}
};

const chargeColumns: ColumnData[] = [
	{
		title: 'Subscription Type',
		render: (row) => {
			return <span className='text-[#09090B]'>{formatPriceType(row.type)}</span>;
		},
	},
	{
		title: 'Feature',
		render(rowData) {
			return <span className='text-[#09090B]'>{rowData.meter?.name ?? '--'}</span>;
		},
	},
	{
		title: 'Billing Period',
		render(rowData) {
			return <span className='text-[#09090B]'>{toSentenceCase(rowData.billing_period as string)}</span>;
		},
	},
	{
		title: 'Value',
		render(rowData) {
			return <ValueCell data={rowData} />;
		},
	},
];

const getFeatureValue = (entitlement: ExtendedEntitlement) => {
	switch (entitlement.feature_type) {
		case FeatureType.static:
			return entitlement.static_value;
		case FeatureType.metered:
			return (
				<span className='flex items-center gap-1'>
					{entitlement.usage_limit ?? 'Unlimited'}
					<span className='text-[#64748B] text-xs font-normal font-sans'>units</span>
				</span>
			);
		case FeatureType.boolean:
			return entitlement.static_value ? 'Yes' : 'No';
		default:
			return '--';
	}
};
const ValueCell = ({ data }: { data: Price }) => {
	const price = getPriceTableCharge(data as any, false);
	return <div>{price}</div>;
};

const PlanViewPage = () => {
	const navigate = useNavigate();
	const { planId } = useParams<Params>();
	const [drawerOpen, setdrawerOpen] = useState(false);

	const {
		data: planData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchPlan', planId],
		queryFn: async () => {
			return await PlanApi.getPlanById(planId!);
		},
		enabled: !!planId,
	});

	const { updateBreadcrumb } = useBreadcrumbsStore();

	useEffect(() => {
		if (planData?.name) {
			updateBreadcrumb(2, planData.name);
		}
	}, [planData, updateBreadcrumb]);

	const columnData: ColumnData<ExtendedEntitlement>[] = [
		{
			title: 'Feature Name',
			onCellClick(row) {
				navigate(RouteNames.featureDetails + `/${row?.feature?.id}`);
			},
			render(row) {
				return row?.feature?.name;
			},
		},
		{
			title: 'Meter',
			render(row) {
				return row?.feature.meter?.name ?? '--';
			},
		},
		{
			title: 'Type',

			render(row) {
				return getFeatureTypeChips(row?.feature_type || '');
			},
		},
		{
			title: 'Value',

			render(row) {
				return getFeatureValue(row);
			},
		},
		{
			fieldVariant: 'interactive',
			width: '30px',
			hideOnEmpty: true,
			render(row) {
				return (
					<ActionButton
						deleteMutationFn={async () => {
							return await EntitlementApi.deleteEntitlementById(row?.id);
						}}
						id={row?.id}
						editPath={''}
						isEditDisabled={true}
						isArchiveDisabled={row?.status === 'archived'}
						refetchQueryKey={'fetchEntitlements'}
						entityName={row?.feature?.name}
					/>
				);
			},
		},
	];

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('Error loading plan data');
		return null;
	}

	if (!planData) {
		toast.error('No plan data available');
		return null;
	}

	return (
		<Page>
			<AddEntitlementDrawer
				selectedFeatures={planData.entitlements?.map((v) => v.feature)}
				entitlements={planData.entitlements}
				planId={planData.id}
				isOpen={drawerOpen}
				onOpenChange={(value) => setdrawerOpen(value)}
			/>

			<div className=' mb-10 space-y-4'>
				{/* <div className='w-full !my-5 flex justify-between items-center'>
					<FormHeader title={planData?.name} variant='form-title' />
					{planData?.status === 'published' && (
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
					)}
				</div> */}

				<DetailsCard
					title='Plan Details'
					data={[
						{ label: 'Plan Name', value: planData?.name },
						{ label: 'Plan Description', value: planData?.description || '--' },
						{ label: 'Created Date', value: formatDate(planData?.created_at ?? '') },
					]}
				/>

				<DetailsCard
					title='Billing Preferences'
					data={[
						{ label: 'Billing Timing', value: formatInvoiceCadence(planData?.invoice_cadence ?? '') },
						{ label: 'Trial Period', value: planData?.trial_period ? `${planData?.trial_period} days` : '--' },
					]}
				/>

				{/* plan charges table */}
				{(planData?.prices?.length ?? 0) > 0 && (
					<div className='card '>
						<FormHeader title='Charges' variant='sub-header' titleClassName='font-semibold' />
						<FlexpriceTable columns={chargeColumns} data={planData?.prices ?? []} />
					</div>
				)}

				<div className='card'>
					<SectionHeader
						showSearch
						showFilter
						showButton
						variant='sub-header'
						title='Entitlements'
						buttonIcon={<Star />}
						onButtonClick={() => setdrawerOpen(true)}
						buttonText='Add Feature'
					/>
					<FlexpriceTable showEmptyRow data={planData.entitlements || []} columns={columnData} />
					{(planData.entitlements?.length || 0) === 0 && (
						<p className=' text-[#64748B] text-xs font-normal font-sans mt-4'>No Entitlements added</p>
					)}
				</div>
			</div>
		</Page>
	);
};

export default PlanViewPage;
