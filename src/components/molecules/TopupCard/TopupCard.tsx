import { Button, FormHeader, Input, Spacer } from '@/components/atoms';
import { Gift, Receipt } from 'lucide-react';
import { FC, useState } from 'react';
import RectangleRadiogroup, { RectangleRadiogroupOption } from '../RectangleRadiogroup';
import { useMutation } from '@tanstack/react-query';
import WalletApi from '@/utils/api_requests/WalletApi';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { queryClient } from '@/App';

export interface TopupCardPayload {
	free_credits?: number;
}

interface Props {
	preFunction?: () => Promise<string | undefined>;
	walletId?: string;
	isPrefunctionLoading?: boolean;
	className?: string;
	onSuccess?: () => void;
}

const TopupCard: FC<Props> = ({ walletId, onSuccess, preFunction, isPrefunctionLoading = false, className }) => {
	const subscriptionTypeOptions: RectangleRadiogroupOption[] = [
		{
			value: 'FIXED',
			label: 'Free Credits',
			icon: Receipt,
			disabled: false,
		},
		{
			value: 'USAGE',
			label: 'Purchase Credits',
			icon: Gift,
			disabled: true,
			comingSoon: true,
		},
	];

	const [freeCredits, setfreeCredits] = useState<number | undefined>();

	const [subscriptionType, setsubscriptionType] = useState<string | undefined>();

	const { isPending, mutate: topupWallet } = useMutation({
		mutationKey: ['topupWallet', walletId],
		mutationFn: async (walletId: string) => {
			return await WalletApi.topupWallet({
				walletId: walletId,
				amount: freeCredits!,
			});
		},
		onSuccess: async () => {
			if (!preFunction) {
				toast.success('Wallet topped up successfully');
			}
			queryClient.invalidateQueries({ queryKey: ['fetcWallets'] });
			queryClient.invalidateQueries({ queryKey: ['fetchWalletBalances'] });
			queryClient.invalidateQueries({ queryKey: ['fetchWalletsTransactions'] });

			// Optionally, refetcph queries immediately
			await Promise.all([
				queryClient.refetchQueries({ queryKey: ['fetcWallets'] }),
				queryClient.refetchQueries({ queryKey: ['fetchWalletBalances'] }),
				queryClient.refetchQueries({ queryKey: ['fetchWalletsTransactions'] }),
			]);
		},
		onSettled: () => {
			setfreeCredits(undefined);
			setsubscriptionType(undefined);
			if (onSuccess) {
				onSuccess();
			}
		},
	});
	const handleTopup = async () => {
		// if (!subscriptionType) {
		// 	toast.error('Subscription type is required');
		// 	return;
		// }
		if (subscriptionType === subscriptionTypeOptions[0].value && !freeCredits) {
			toast.error('Free credits is required');
			return;
		}

		if (preFunction) {
			const id = await preFunction();
			topupWallet(id!);
		}
		console.log('completed with pre function execution', walletId);

		if (walletId && !preFunction) {
			topupWallet(walletId);
		}
	};

	return (
		<div>
			<div className={cn('card space-y-4 lg:w-full', className)}>
				<FormHeader
					title='Wallet Top Up'
					subtitle={`Define credits to purchase and to grant upon wallet creation. Credits for purchase generate invoice, whereas credits for grapnt do not generate invoice`}
					variant='sub-header'
				/>

				<div className=''>
					<RectangleRadiogroup
						options={subscriptionTypeOptions}
						value={subscriptionType}
						onChange={(value) => {
							console.log('subscriptionType', subscriptionType);
							setsubscriptionType(value);
						}}
					/>
				</div>

				{subscriptionType === subscriptionTypeOptions[0].value && (
					<Input
						onChange={(e) => {
							setfreeCredits(parseInt(e));
						}}
						label='Free Credits'
						placeholder='Enter free credits'
					/>
				)}
				<Spacer className='!mt-4' />
				{/* toptup amount cta */}
				{!preFunction && (
					<Button disabled={isPending || isPrefunctionLoading} onClick={handleTopup}>
						Add
					</Button>
				)}
			</div>

			{/* save meter cta */}
			{preFunction && (
				<Button className='!mt-4' disabled={isPending || isPrefunctionLoading} onClick={handleTopup}>
					Save Wallet
				</Button>
			)}
		</div>
	);
};

export default TopupCard;
