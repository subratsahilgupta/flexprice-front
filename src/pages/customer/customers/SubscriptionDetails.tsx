import { Chip, FormHeader, Spacer } from '@/components/atoms';
import { InvoiceLineItemTable } from '@/components/molecules';
import { Skeleton } from '@/components/ui/skeleton';
import SubscriptionApi from '@/utils/api_requests/SubscriptionApi';
import formatChips from '@/utils/common/format_chips';
import { formatDateShort, getCurrencySymbol } from '@/utils/common/helper_functions';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const SubscriptionDetails: FC = () => {
	const { subscription_id } = useParams();
	const { data, isLoading, isError } = useQuery({
		queryKey: ['subscriptionInvoices', subscription_id],
		queryFn: async () => {
			return await SubscriptionApi.getSubscriptionInvoicesPreview({ subscription_id: subscription_id! });
		},
	});

	const { data: subscriptionDetails, isLoading: isSubscriptionDetailsLoading } = useQuery({
		queryKey: ['subscriptionDetails', subscription_id],
		queryFn: async () => {
			return await SubscriptionApi.getSubscriptionById(subscription_id!);
		},
	});

	if (isLoading || isSubscriptionDetailsLoading) {
		return (
			<div className='w-2/3'>
				<Skeleton className='h-48' />
				<Spacer className='!my-4' />
				<Skeleton className='h-60' />
			</div>
		);
	}

	if (isError) {
		toast.error('Something went wrong');
	}

	return (
		<div className='w-2/3'>
			<div className='card'>
				<FormHeader title='Subscription details' variant='sub-header' titleClassName='font-semibold' />
				<div className='w-full flex justify-between items-center'>
					<p className='text-[#71717A] text-sm'>Subscription name</p>
					<p className='text-[#09090B] text-sm'>{subscriptionDetails?.plan.name ?? '--'}</p>
				</div>
				<Spacer className='!my-4' />
				<div className='w-full flex justify-between items-center'>
					<p className='text-[#71717A] text-sm'>Status</p>
					<p className='text-[#09090B] text-sm'>
						<Chip
							activeTextColor='#377E6A'
							activeBgColor='#ECFBE4'
							isActive={formatChips(subscriptionDetails?.status ?? '') === 'Active'}
							label={formatChips(subscriptionDetails?.status ?? '')}
						/>
					</p>
				</div>
				<Spacer className='!my-4' />

				<div className='w-full flex justify-between items-center'>
					<p className='text-[#71717A] text-sm'>Start date</p>
					<p className='text-[#09090B] text-sm'>{formatDateShort(subscriptionDetails?.current_period_start ?? '')}</p>
				</div>
				<Spacer className='!my-4' />

				<div className='w-full flex justify-between items-center'>
					<p className='text-[#71717A] text-sm'>Upcoming Invoice</p>
					<p className='text-[#09090B] text-sm'>{`${getCurrencySymbol(data?.currency ?? '')}${data?.amount_due} on ${formatDateShort(subscriptionDetails?.current_period_end ?? '')}`}</p>
				</div>
			</div>

			{(data?.line_items?.length ?? 0) > 0 && (
				<div className='card !mt-4'>
					<InvoiceLineItemTable
						currency={data?.currency}
						amount_due={data?.amount_due}
						title='Upcoming Invoices'
						data={data?.line_items ?? []}
					/>
				</div>
			)}
		</div>
	);
};

export default SubscriptionDetails;
