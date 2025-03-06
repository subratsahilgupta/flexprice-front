import { FormHeader, Input, Select, Spacer } from '@/components/atoms';
import { TopupCard } from '@/components/molecules';
import { currencyOptions } from '@/core/data/constants';
import { refetchQueries } from '@/core/tanstack/ReactQueryProvider';
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
	const [walletName, setwalletName] = useState('Prepaid Wallet');
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
			refetchQueries(['fetchWallets']);
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

		const wallet = await createWallet();
		return wallet.id;
	};

	return (
		<div>
			<FormHeader
				title='Create Wallet'
				subtitle={`Manage credits for usage-based billing that can apply to invoices pre-tax.`}
				variant='form-title'
			/>
			<Spacer className='!mt-4' />
			<div className='card space-y-4'>
				<FormHeader title='Wallet setup' subtitle={`Define the wallet details and the currency it will operate in.`} variant='sub-header' />
				<Input error={errors.walletName} value={walletName} onChange={setwalletName} label='Wallet Name' placeholder='Enter wallet name' />

				<Select
					value={currency}
					options={currencyOptions}
					label='Select Currency'
					onChange={setcurrency}
					placeholder='Select Currency'
					error={errors.currency}
				/>
			</div>
			<Spacer className='!mt-4' />
			<TopupCard
				currency={currency}
				onSuccess={() => onClose(false)}
				isPrefunctionLoading={isPending}
				walletId={walletData?.id}
				preFunction={async () => await handleCreateWallet()}
			/>
		</div>
	);
};

export default CreateWallet;
