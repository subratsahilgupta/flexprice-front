import { FormHeader, Loader } from '@/components/atoms';
import WalletApi from '@/utils/api_requests/WalletApi';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const Wallet = () => {
	const { id: customerId } = useParams();
	const [activeWallet, setActiveWallet] = useState<Wallet | null>();

	const {
		data: wallets,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetcWallets', customerId],
		queryFn: async () => {
			return await WalletApi.getWallets(customerId!);
		},
		enabled: !!customerId,
	});

	useEffect(() => {
		if (wallets && wallets.length > 0) {
			setActiveWallet(wallets[0]);
		}
	}, [wallets]);

	if (isLoading) {
		return <Loader />;
	}

	if (isError) {
		toast.error('An error occurred while fetching wallet details');
		return <p>Something went wrong</p>;
	}

	return (
		<div>
			<FormHeader
				className='!my-6'
				title='Wallets'
				subtitle="Make changes to your account here. Click save when you're done."
				variant='form-title'
			/>
			<div className='rounded-xl border border-gray-300 p-6'>
				<FormHeader title='Wallet Details' variant='sub-header' titleClassName='font-semibold' />
				{}
				<pre>{JSON.stringify(wallets, null, 2)}</pre>
				<p className='text-gray-500 text-sm'>No wallet information available</p>
			</div>
		</div>
	);
};

export default Wallet;
