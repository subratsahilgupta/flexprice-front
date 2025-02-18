import { Button, FormHeader, Input, Spacer } from '@/components/atoms';
import { Gift, Receipt } from 'lucide-react';
import { FC, useState } from 'react';
import RectangleRadiogroup, { RectangleRadiogroupOption } from '../RectangleRadiogroup';
import { useMutation } from '@tanstack/react-query';
import WalletApi from '@/utils/api_requests/WalletApi';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { queryClient } from '@/App';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import PremiumFeature, { PremiumFeatureTag } from '../PremiumFeature';
export interface TopupCardPayload {
	free_credits?: number;
}

interface Props {
	preFunction?: () => Promise<string | undefined>;
	walletId?: string;
	isPrefunctionLoading?: boolean;
	className?: string;
	onSuccess?: () => void;
	currency?: string;
}

const TopupCard: FC<Props> = ({ walletId, onSuccess, preFunction, isPrefunctionLoading = false, className, currency }) => {
	const [autoTopup, setautoTopup] = useState(false);

	const subscriptionTypeOptions: RectangleRadiogroupOption[] = [
		{
			value: 'FIXED',
			label: 'Free Credits',
			icon: Receipt,
			disabled: false,
		},
		{
			value: 'USAGE',
			label: 'Purchased Credits',
			icon: Gift,
			disabled: true,
			premium: true,
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

		if (walletId && !preFunction) {
			topupWallet(walletId);
		}
	};

	return (
		<div>
			<div className={cn('card space-y-4 lg:w-full', className)}>
				<FormHeader title='Add Credits' subtitle={`Define credits to purchase and to grant upon wallet creation`} variant='sub-header' />

				<div className=''>
					<RectangleRadiogroup
						title='Select Credit Type'
						options={subscriptionTypeOptions}
						value={subscriptionType}
						onChange={(value) => {
							setsubscriptionType(value);
						}}
						description=''
					/>
				</div>

				{subscriptionType === subscriptionTypeOptions[0].value && (
					<Input
						onChange={(e) => {
							setfreeCredits(parseInt(e));
						}}
						suffix='credits'
						label='Free Credits'
						inputPrefix={currency ? getCurrencySymbol(currency) : undefined}
						placeholder='Enter free credits'
					/>
				)}
				<Spacer className='!mt-4' />
				{/* toptup amount cta */}
				{!preFunction && (
					<div className='w-full justify-end flex'>
						<Button disabled={isPending || isPrefunctionLoading} onClick={handleTopup}>
							Add
						</Button>
					</div>
				)}
			</div>

			<Spacer className='!mt-4' />
			<PremiumFeature isPremiumFeature>
				<div className='card relative'>
					<span className='absolute top-3 right-3'>
						<PremiumFeatureTag />
					</span>
					<FormHeader
						title='Automatic Wallet Top Up'
						subtitle={`Never run out of balance. Set up automatic top-ups to stay worry-free.`}
						variant='sub-header'
					/>
					<div className='flex items-center space-x-4 font-open-sans'>
						<Switch
							id='airplane-mode'
							checked={autoTopup}
							onCheckedChange={(value) => {
								setautoTopup(value);
							}}
						/>
						<Label htmlFor='airplane-mode'>
							<p className='font-medium text-sm text-[#18181B] peer-checked:text-black'>Recharge Wallet Automatically</p>
						</Label>
					</div>

					{autoTopup && (
						<div className='space-y-4 mt-4'>
							<Input
								suffix='credits'
								inputPrefix={currency ? getCurrencySymbol(currency) : undefined}
								label='Enter minimum balance amount below which we top up '
								placeholder='Enter Minimum Balance'
							/>
							<Input
								suffix='credits'
								inputPrefix={currency ? getCurrencySymbol(currency) : undefined}
								label='How much should we add?'
								placeholder='Enter Topup Amount'
								className='w-1/2'
							/>
							<div className='flex items-center space-x-2'>
								{['+100', '+500', '+1000', '+2000'].map((item) => (
									<button className='text-xs font-medium text-zinc-600 rounded-md px-2 py-[2px] bg-zinc-100'>{item}</button>
								))}
							</div>
						</div>
					)}
				</div>
			</PremiumFeature>

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
