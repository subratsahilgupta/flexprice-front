import { ActionButton, Button, CardHeader, Chip, Loader, Page, Spacer, Progress } from '@/components/atoms';
import { AddEntitlementDrawer, ColumnData, FlexpriceTable } from '@/components/molecules';
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
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/atoms';
import formatChips from '@/utils/common/format_chips';
import { getFeatureIcon } from '@/components/atoms/SelectFeature/SelectFeature';

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
					{entitlement.usage_limit ?? 'Unlimited'}
					<span className='text-[#64748B] text-sm font-normal font-sans'>units</span>
				</span>
			);
		case FeatureType.boolean:
			return entitlement.is_enabled ? 'True' : 'False';
		default:
			return '--';
	}
};
const ValueCell = ({ data }: { data: Price }) => {
	const price = getPriceTableCharge(data as any, false);
	return <div>{price}</div>;
};

const columnData: ColumnData<ExtendedEntitlement>[] = [
	{
		title: 'Feature',
		fieldVariant: 'title',
		render(row) {
			return (
				<Link className='inline-flex gap-2 items-center' to={RouteNames.featureDetails + `/${row?.feature?.id}`}>
					{getFeatureTypeChips(row?.feature_type || '')}
					{row?.feature?.name}
				</Link>
			);
		},
	},
	{
		title: 'Source	',
		render() {
			return <span>{'--'}</span>;
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
			if (row?.feature_type != FeatureType.metered) {
				return '--';
			}
			const usage = Math.floor(Math.random() * 100);
			const limit = row?.usage_limit ?? 100;
			const value = Math.ceil((usage / limit) * 100);
			// const resetLabel = row.usage_reset_period ? `Resets ${formatBillingPeriod(row.usage_reset_period)}` : '';

			const indicatorColor = value >= 100 ? 'bg-red-600' : 'bg-green-800';
			const backgroundColor = value >= 100 ? 'bg-red-50' : 'bg-green-50';

			const label = row.usage_reset_period ? `${usage} / ${limit}` : `${usage} / No Limit`;
			return <Progress label={label} value={value} className='h-[6px]' indicatorColor={indicatorColor} backgroundColor={backgroundColor} />;
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
