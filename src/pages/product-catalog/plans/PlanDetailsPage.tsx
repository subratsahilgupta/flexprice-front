import { ActionButton, Button, CardHeader, Chip, Loader, Page, Spacer, NoDataCard } from '@/components/atoms';
import { AddEntitlementDrawer, ApiDocsContent, ColumnData, FlexpriceTable } from '@/components/molecules';
import { DetailsCard } from '@/components/molecules';
import { RouteNames } from '@/core/routes/Routes';
import { Price } from '@/models/Price';
import { FeatureType } from '@/models/Feature';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import EntitlementApi, { ExtendedEntitlement } from '@/utils/api_requests/EntitlementApi';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import formatDate from '@/utils/common/format_date';
import { getPriceTypeLabel } from '@/utils/common/helper_functions';
import { getPriceTableCharge } from '@/utils/models/transformed_plan';
import { useMutation, useQuery } from '@tanstack/react-query';
import { EyeOff, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/atoms';
import formatChips from '@/utils/common/format_chips';
import { getFeatureTypeChips } from '@/components/molecules/CustomerUsageTable/CustomerUsageTable';
import { formatAmount } from '@/components/atoms/Input/Input';

const formatBillingPeriod = (billingPeriod: string) => {
	switch (billingPeriod.toUpperCase()) {
		case 'DAILY':
			return 'Daily';
		case 'WEEKLY':
			return 'Weekly';
		case 'MONTHLY':
			return 'Monthly';
		case 'ANNUAL':
			return 'Yearly';
		case 'QUARTERLY':
			return 'Quarterly';
		case 'HALF_YEARLY':
			return 'Half Yearly';
		default:
			return '--';
	}
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

type Params = {
	planId: string;
};

// const formatInvoiceCadence = (cadence: string): string => {
// 	switch (cadence.toUpperCase()) {
// 		case 'ADVANCE':
// 			return 'Advance';
// 		case 'ARREAR':
// 			return 'Arrear';
// 		default:
// 			return '';
// 	}
// };

const chargeColumns: ColumnData[] = [
	{
		title: 'Charge Type',
		render: (row) => {
			return <span>{getPriceTypeLabel(row.type)}</span>;
		},
		fieldVariant: 'title',
	},
	{
		title: 'Feature',
		render(rowData) {
			return <span>{rowData.meter?.name ?? '--'}</span>;
		},
	},
	{
		title: 'Billing timing ',
		render(rowData) {
			return <span>{formatInvoiceCadence(rowData.invoice_cadence as string)}</span>;
		},
	},
	{
		title: 'Billing Period',
		render(rowData) {
			return <span>{formatBillingPeriod(rowData.billing_period as string)}</span>;
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
				<span className='flex items-end gap-1'>
					{formatAmount(entitlement.usage_limit?.toFixed() || '') ?? 'Unlimited'}
					<span className='text-[#64748B] text-sm font-normal font-sans'>units</span>
				</span>
			);
		case FeatureType.boolean:
			return entitlement.is_enabled ? 'Yes' : 'No';
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

	const { mutate: archivePlan } = useMutation({
		mutationFn: async () => {
			return await PlanApi.deletePlan(planId!);
		},
		onSuccess: () => {
			toast.success('Plan archived successfully');
			navigate(RouteNames.plan);
		},
		onError: () => {
			toast.error('Failed to archive plan');
		},
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
			fieldVariant: 'title',
			render(row) {
				return row?.feature?.name;
			},
		},
		// {
		// 	title: 'Meter',
		// 	render(row) {
		// 		return row?.feature.meter?.name ?? '--';
		// 	},
		// },
		{
			title: 'Type',

			render(row) {
				return getFeatureTypeChips({ type: row?.feature_type || '', showIcon: true, showLabel: true });
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
						refetchQueryKey={'fetchPlan'}
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
		{
			label: 'Status',
			value: <Chip label={formatChips(planData?.status)} variant={planData?.status === 'published' ? 'success' : 'default'} />,
		},
	];

	return (
		<Page
			heading={planData?.name}
			headingCTA={
				<Button onClick={() => archivePlan()} disabled={planData?.status !== 'published'} variant={'outline'} className='flex gap-2'>
					<EyeOff />
					Archive
				</Button>
			}>
			<ApiDocsContent tags={['Plans']} />
			<AddEntitlementDrawer
				selectedFeatures={planData.entitlements?.map((v) => v.feature)}
				entitlements={planData.entitlements}
				planId={planData.id}
				isOpen={drawerOpen}
				onOpenChange={(value) => setdrawerOpen(value)}
			/>

			<div className='space-y-6'>
				<DetailsCard variant='stacked' title='Plan Details' data={planDetails} />

				{/* plan charges table */}
				{(planData?.prices?.length ?? 0) > 0 && (
					<Card variant='notched'>
						<CardHeader title='Charges' />
						<FlexpriceTable columns={chargeColumns} data={planData?.prices ?? []} />
					</Card>
				)}

				{planData.entitlements?.length || 0 > 0 ? (
					<Card variant='notched'>
						<CardHeader title='Entitlements' />
						<FlexpriceTable showEmptyRow data={planData.entitlements || []} columns={columnData} />
					</Card>
				) : (
					<NoDataCard
						title='Entitlements'
						subtitle='No entitlements added to the plan yet'
						cta={
							<Button prefixIcon={<Plus />} onClick={() => setdrawerOpen(true)}>
								Add
							</Button>
						}
					/>
				)}
				<Spacer className='!h-10' />
			</div>
		</Page>
	);
};

export default PlanDetailsPage;
