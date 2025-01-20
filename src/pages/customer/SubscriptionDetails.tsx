import { Chip, FormHeader, Spacer } from '@/components/atoms';
import { InvoiceLineItemTable } from '@/components/molecules';
import { Skeleton } from '@/components/ui/skeleton';
import SubscriptionApi from '@/utils/api_requests/SubscriptionApi';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import toast from 'react-hot-toast';

type Props = {
	subscription_id: string;
};

const SubscriptionDetails: FC<Props> = ({ subscription_id }) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['subscription', subscription_id],
		queryFn: async () => {
			return await SubscriptionApi.getSubscriptionInvoicesPreview({ subscription_id });
		},
	});

	if (isLoading) {
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
			<div className='rounded-xl border border-gray-300 p-6'>
				<FormHeader title='Wallet Details' variant='sub-header' titleClassName='font-semibold' />
				<div className='w-full flex justify-between items-center'>
					<p className='text-[#71717A] text-sm'>Wallet Name</p>
					<p className='text-[#09090B] text-sm'>{'Prepaid wallet'}</p>
				</div>
				<Spacer className='!my-4' />
				<div className='w-full flex justify-between items-center'>
					<p className='text-[#71717A] text-sm'>Status</p>
					<p className='text-[#09090B] text-sm'>
						<Chip activeTextColor='#377E6A' activeBgColor='#ECFBE4' isActive={true} label={'Active'} />
					</p>
				</div>
				<Spacer className='!my-4' />

				<div className='w-full flex justify-between items-center'>
					<p className='text-[#71717A] text-sm'>Start date</p>
					<p className='text-[#09090B] text-sm'>{'Prepaid wallet'}</p>
				</div>
				<Spacer className='!my-4' />

				<div className='w-full flex justify-between items-center'>
					<p className='text-[#71717A] text-sm'>Upcoming Invoice</p>
					<p className='text-[#09090B] text-sm'>{'Prepaid wallet'}</p>
				</div>
			</div>

			<InvoiceLineItemTable title='Upcoming Invoices' data={data?.line_items ?? []} />
		</div>
	);
};

export default SubscriptionDetails;
