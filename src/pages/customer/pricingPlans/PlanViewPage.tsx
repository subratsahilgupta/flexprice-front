import { Button, FormHeader, Loader, Spacer } from '@/components/atoms';
import { ColumnData, FlexpriceTable } from '@/components/molecules';
import { Price } from '@/models/Price';
import { PlanApi } from '@/utils/api_requests/PlanApi';
import formatDate from '@/utils/common/format_date';
import { toSentenceCase } from '@/utils/common/helper_functions';
import { useQuery } from '@tanstack/react-query';
import { EyeOff, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

type Params = {
	planId: string;
};

const formatSubscriptionType = (type: string): string => {
	switch (type.toUpperCase()) {
		case 'RECURRING':
			return 'Recurring';
		case 'USAGE':
			return 'Usage Based';
		default:
			return '';
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

const columns: ColumnData[] = [
	{
		title: 'Subscription Type',
		fieldName: 'billing_cadence',
		render: (row) => {
			return <span className='text-[#09090B]'>{formatSubscriptionType(row.billing_cadence)}</span>;
		},
	},
	{
		title: 'Billable Metric',
		fieldName: 'price',
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
	return <div>{data.amount}</div>;
};

const PlanViewPage = () => {
	const { planId } = useParams<Params>();

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

	if (isLoading) {
		return <Loader />;
	}
	if (isError) {
		toast.error('Error fetching plan');
	}

	return (
		<div className='w-2/3'>
			<div className='w-full !my-5 flex justify-between items-center'>
				<FormHeader title={planData?.name.toUpperCase()} variant='form-title' />
				<div className='flex gap-2'>
					<Button variant={'outline'} className='flex gap-2'>
						<EyeOff />
						Archive
					</Button>
					<Button className='flex gap-2'>
						<Pencil />
						Edit
					</Button>
				</div>
			</div>

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
					<p className='text-[#09090B] text-sm'>{planData?.trial_period || '--'}</p>
				</div>
			</div>

			{(planData?.prices?.length ?? 0) > 0 && (
				<div className='card mt-4'>
					<FormHeader title='Charges' subtitle='Assign a name to your event schema ' variant='sub-header' titleClassName='font-semibold' />
					<FlexpriceTable columns={columns} data={planData?.prices ?? []} />
				</div>
			)}
		</div>
	);
};

export default PlanViewPage;
