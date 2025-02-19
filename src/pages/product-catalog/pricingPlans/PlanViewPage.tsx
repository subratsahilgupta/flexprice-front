import { FormHeader, Loader, SectionHeader, Spacer } from '@/components/atoms';
import { AddEntitlementDrawer, ColumnData, FeatureTable, FlexpriceTable } from '@/components/molecules';
import { Price } from '@/models/Price';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import formatDate from '@/utils/common/format_date';
import { formatPriceType, toSentenceCase } from '@/utils/common/helper_functions';
import { getPriceTableCharge } from '@/utils/models/transformed_plan';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

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
		fieldName: 'billing_cadence',
		render: (row) => {
			return <span className='text-[#09090B]'>{formatPriceType(row.type)}</span>;
		},
	},
	{
		title: 'Billable Metric',
		fieldName: 'price',
		render(rowData) {
			return <span className='text-[#09090B]'>{rowData.meter?.name ?? '--'}</span>;
		},
	},
	{
		title: 'Billing Period',
		fieldName: 'price',
		render(rowData) {
			return <span className='text-[#09090B]'>{toSentenceCase(rowData.billing_period as string)}</span>;
		},
	},
	{
		title: 'Value',
		fieldName: 'price',
		render(rowData) {
			return <ValueCell data={rowData} />;
		},
	},
];

const ValueCell = ({ data }: { data: Price }) => {
	const price = getPriceTableCharge(data as any, false);
	return <div>{price}</div>;
};

const PlanViewPage = () => {
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

	if (isLoading) {
		return <Loader />;
	}
	if (isError) {
		toast.error('Error fetching plan');
	}

	const entittlements = planData?.entitlements;

	return (
		<div className='page'>
			{/* create entitlement drawer */}
			<AddEntitlementDrawer
				selectedFeatures={entittlements?.map((v) => v.feature) || []}
				entitlements={entittlements}
				planId={planData?.id}
				isOpen={drawerOpen}
				onOpenChange={(value) => setdrawerOpen(value)}
			/>

			<div className='w-2/3 mb-10'>
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

				<div className='card'>
					<FormHeader title='Plan details' variant='sub-header' titleClassName='font-semibold' />
					<div className='w-full flex justify-between items-center'>
						<p className='text-[#71717A] text-sm'>Plan Name</p>
						<p className='text-[#09090B] text-sm'>{planData?.name}</p>
					</div>
					<Spacer className='!my-4' />
					<div className='w-full flex justify-between items-center'>
						<p className='text-[#71717A] text-sm'>Plan Description</p>
						<p className='text-[#09090B] text-sm'>{planData?.description || '--'}</p>
					</div>
					<Spacer className='!my-4' />
					<div className='w-full flex justify-between items-center'>
						<p className='text-[#71717A] text-sm'>Created Date</p>
						<p className='text-[#09090B] text-sm'>{formatDate(planData?.created_at ?? '')}</p>
					</div>
				</div>

				<Spacer className='!my-4' />
				<div className='card'>
					<FormHeader title='Billing Preferences' variant='sub-header' titleClassName='font-semibold' />
					<div className='w-full flex justify-between items-center'>
						<p className='text-[#71717A] text-sm'>Billing Timing</p>
						<p className='text-[#09090B] text-sm'>{formatInvoiceCadence(planData?.invoice_cadence ?? '')}</p>
					</div>
					<Spacer className='!my-4' />
					<div className='w-full flex justify-between items-center'>
						<p className='text-[#71717A] text-sm'>Trial Period</p>
						<p className='text-[#09090B] text-sm'>{planData?.trial_period ? `${planData?.trial_period} days` : '--'}</p>
					</div>
				</div>

				{/* plan charges table */}
				{(planData?.prices?.length ?? 0) > 0 && (
					<div className='card mt-4'>
						<FormHeader title='Charges' variant='sub-header' titleClassName='font-semibold' />
						<FlexpriceTable columns={chargeColumns} data={planData?.prices ?? []} />
					</div>
				)}

				<div className='card mt-4'>
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
					<FeatureTable showEmptyRow emptyRowMessage='No entitlements found' data={entittlements?.map((v) => v.feature) || []} />
					{(entittlements?.length || 0) === 0 && (
						<p className=' text-[#64748B] text-xs font-normal font-sans mt-4'>No Entitlements added</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default PlanViewPage;
