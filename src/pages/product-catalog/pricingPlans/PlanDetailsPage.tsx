import { ActionButton, Button, CardHeader, Loader, Page, Spacer } from '@/components/atoms';
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
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/atoms';

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

const PlanDetailsPage = () => {
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

	const planDetails = [
		{ label: 'Plan Name', value: planData?.name },
		{ label: 'Plan Description', value: planData?.description || '--' },
		{ label: 'Created Date', value: formatDate(planData?.created_at ?? '') },
		{ label: 'Status', value: planData?.status },
		{
			variant: 'divider' as const,
			className: 'my-4',
		},
		{
			variant: 'heading' as const,
			label: 'Billing Details',
			className: 'mb-4',
		},
		{ label: 'Billing Timing', value: formatInvoiceCadence(planData?.invoice_cadence ?? '') },
		{ label: 'Trial Period', value: planData?.trial_period ? `${planData?.trial_period} days` : '--' },
	];

	return (
		<Page heading={planData?.name}>
			<AddEntitlementDrawer
				selectedFeatures={planData.entitlements?.map((v) => v.feature)}
				entitlements={planData.entitlements}
				planId={planData.id}
				isOpen={drawerOpen}
				onOpenChange={(value) => setdrawerOpen(value)}
			/>

			<div className='space-y-6'>
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

				<DetailsCard variant='stacked' title='Plan Details' data={planDetails} />

				{/* plan charges table */}
				{(planData?.prices?.length ?? 0) > 0 && (
					<Card variant='notched'>
						<CardHeader title='Charges' />
						<FlexpriceTable columns={chargeColumns} data={planData?.prices ?? []} />
					</Card>
				)}

				<Card variant='notched'>
					<CardHeader
						title='Entitlements'
						cta={
							<Button prefixIcon={<Plus />} onClick={() => setdrawerOpen(true)}>
								Add
							</Button>
						}
					/>
					<FlexpriceTable showEmptyRow data={planData.entitlements || []} columns={columnData} />
					{(planData.entitlements?.length || 0) === 0 && (
						<p className='text-[#64748B] text-xs font-normal font-sans mt-4'>No Entitlements added</p>
					)}
				</Card>

				<Spacer className='!h-10' />
			</div>
		</Page>
	);
};

export default PlanDetailsPage;
