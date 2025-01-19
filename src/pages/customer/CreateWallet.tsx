import { FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { TopupCard } from '@/components/molecules';
import { currencyOptions } from '@/core/data/constants';
import WalletApi from '@/utils/api_requests/WalletApi';
import { useMutation } from '@tanstack/react-query';
import { FC, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
	customerId: string;
	isVisible?: boolean;
	onClose?: (value: boolean) => void;
}

const CreateWallet: FC<Props> = ({ customerId, onClose = () => {} }) => {
	const [walletName, setwalletName] = useState('predefined-wallet-');
	const [currency, setcurrency] = useState(currencyOptions[0].value);
	const [errors, setErrors] = useState({
		currency: '',
		walletName: '',
	});

	const {
		data: walletData,
		mutateAsync: createWallet,
		isPending,
	} = useMutation({
		mutationKey: ['createWallet', customerId],
		mutationFn: async () => {
			return await WalletApi.createWallet({
				currency,
				customerId,
				name: walletName,
			});
		},

		onError: () => {
			toast.error('An error occurred while creating wallet');
		},
		onSuccess: () => {
			toast.success('Wallet created successfully');
		},
	});

	const handleCreateWallet = async () => {
		if (!walletName) {
			setErrors((prev) => ({ ...prev, walletName: 'Wallet name is required' }));
			return;
		}

		if (!currency) {
			setErrors((prev) => ({ ...prev, currency: 'Currency is required' }));
			return;
		}
		console.log('starting create wallet');

		const wallet = await createWallet();
		console.log('wallet created ');
		return wallet.id;
	};

	return (
		<div className='w-2/3'>
			<FormHeader title='Create Wallet' subtitle={`Make changes to your account here. Click save when you're done.`} variant='form-title' />
			<Spacer className='!mt-4' />
			<div className='card space-y-4'>
				<FormHeader
					title='Wallet'
					subtitle={`Assign a name to your event schema to easily identify and track events processed.`}
					variant='sub-header'
				/>
				<Input error={errors.walletName} value={walletName} onChange={setwalletName} label='Wallet Name' placeholder='Enter wallet name' />

				<Select
					selectedValue={currency}
					options={currencyOptions}
					label='Select Currency'
					onChange={setcurrency}
					placeholder='Select Currency'
					error={errors.currency}
				/>
			</div>
			<Spacer className='!mt-4' />
			<TopupCard
				onSuccess={() => onClose(false)}
				isPrefunctionLoading={isPending}
				walletId={walletData?.id}
				preFunction={async () => await handleCreateWallet()}
			/>
		</div>
	);
};

export default CreateWallet;
