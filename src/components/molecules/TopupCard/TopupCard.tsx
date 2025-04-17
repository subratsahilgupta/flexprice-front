import { Button, FormHeader, Input, Spacer } from '@/components/atoms';
import { Gift, Receipt } from 'lucide-react';
import { FC, useState } from 'react';
import RectangleRadiogroup, { RectangleRadiogroupOption } from '../RectangleRadiogroup';
import { useMutation } from '@tanstack/react-query';
import WalletApi from '@/utils/api_requests/WalletApi';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import PremiumFeature, { PremiumFeatureTag } from '../PremiumFeature';
import { refetchQueries } from '@/core/tanstack/ReactQueryProvider';
import { TransactionReason } from '@/models/Wallet';
import { v4 as uuidv4 } from 'uuid';
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
			description: 'Grant credits without a charge.',
		},
		{
			value: 'USAGE',
			label: 'Purchased Credits',
			icon: Gift,
			disabled: true,
			premium: true,
			description: 'Add credits that require payment.',
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
				idempotency_key: uuidv4(),
				transaction_reason: TransactionReason.FreeCredit,
			});
		},
		onSuccess: async () => {
			if (!preFunction) {
				toast.success('Wallet topped up successfully');
			}
			await refetchQueries(['fetchWallets']);
			await refetchQueries(['fetchWalletBalances']);
			await refetchQueries(['fetchWalletsTransactions']);
		},
		onSettled: async () => {
			setfreeCredits(undefined);
			setsubscriptionType(undefined);
			if (onSuccess) {
				onSuccess();
			}
			await refetchQueries(['fetchWallets']);
			await refetchQueries(['fetchWalletBalances']);
			await refetchQueries(['fetchWalletsTransactions']);
		},
		onError: (err: ServerError) => {
			toast.error(err.error.message || 'Failed to topup wallet');
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
			if (subscriptionType === subscriptionTypeOptions[0].value && freeCredits && freeCredits > 0) {
				topupWallet(id!);
			} else {
				onSuccess?.();
			}
		}

		if (walletId && !preFunction && subscriptionType === subscriptionTypeOptions[0].value && freeCredits && freeCredits > 0) {
			topupWallet(walletId);
		} else {
			onSuccess?.();
		}
	};
	return (
		<div>
			<div className={cn('card space-y-4 lg:w-full', className)}>
				<FormHeader title='Add Credits' subtitle={`Define number of credits to add to the wallet`} variant='sub-header' />

				<div>
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
						variant='number'
						onChange={(e) => {
							setfreeCredits(e as unknown as number);
						}}
						value={freeCredits}
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
						<Button disabled={isPending || isPrefunctionLoading || !subscriptionType} onClick={handleTopup}>
							Add
						</Button>
					</div>
				)}
			</div>

			{preFunction && (
				<>
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
								<div className='sp	ace-y-4 mt-4'>
									<Input
										variant='number'
										suffix='credits'
										inputPrefix={currency ? getCurrencySymbol(currency) : undefined}
										label='Enter minimum balance amount below which we top up '
										placeholder='Enter Minimum Balance'
									/>
									<Input
										variant='number'
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
				</>
			)}

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
