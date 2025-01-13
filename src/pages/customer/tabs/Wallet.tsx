import { Chip, FormHeader, Loader, Spacer } from '@/components/atoms';
import { Pagination, WalletTransactionsTable } from '@/components/molecules';
import usePagination from '@/hooks/usePagination';
import WalletApi from '@/utils/api_requests/WalletApi';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoSearch } from 'react-icons/io5';
import { LiaSlidersHSolid } from 'react-icons/lia';
import { useParams } from 'react-router-dom';

const formatWalletStatus = (status?: string) => {
	switch (status) {
		case 'active':
			return 'Active';
		case 'frozen':
			return 'Frozen';
		case 'closed':
			return 'Closed';
		default:
			return 'Unknown';
	}
};

const Wallet = () => {
	const { id: customerId } = useParams();
	const [activeWallet, setActiveWallet] = useState<Wallet | null>();
	const { limit, offset } = usePagination();

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

	const {
		data: transactionsData,
		// isLoading: isTransactionLoading,
		// isError: isTransactionError,
	} = useQuery({
		queryKey: ['fetchWalletsTransactions', customerId, activeWallet?.id],
		queryFn: async () => {
			return await WalletApi.getWalletTransactions({
				walletId: activeWallet ? activeWallet.id : '',
			});
		},
		enabled: !!customerId && !!activeWallet,
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
		<div className='w-2/3'>
			<FormHeader
				className='!my-6'
				title='Wallets'
				subtitle="Make changes to your account here. Click save when you're done."
				variant='form-title'
			/>

			{/* wallet info */}
			<div className='rounded-xl border border-gray-300 p-6'>
				<FormHeader title='Wallet Details' variant='sub-header' titleClassName='font-semibold' />
				<div className='w-full flex justify-between items-center'>
					<p className='text-[#71717A] text-sm'>Wallet Name</p>
					<p className='text-[#09090B] text-sm'>{activeWallet?.id}</p>
				</div>
				<Spacer className='!my-4' />
				<div className='w-full flex justify-between items-center'>
					<p className='text-[#71717A] text-sm'>Status</p>
					<p className='text-[#09090B] text-sm'>
						<Chip
							isActive={formatWalletStatus(activeWallet?.wallet_status) === 'Active'}
							label={formatWalletStatus(activeWallet?.wallet_status)}
						/>
					</p>
				</div>
			</div>
			<Spacer className='!h-4' />

			{/* wallet moneyy */}
			<div className='w-full grid grid-cols-2 gap-4'>
				<div className='card w-full'>
					<p className='text-[#71717A] text-sm'>Current Balance</p>
					<Spacer className='!my-2' />
					<p className='text-[#09090B] font-semibold text-3xl '>${activeWallet?.balance}</p>
				</div>
				<div className='card w-full'>
					<p className='text-[#71717A] text-sm'>Ongoing Balance</p>
					<Spacer className='!my-2' />
					<p className='text-[#09090B] font-semibold text-3xl '>${activeWallet?.balance}</p>
				</div>
			</div>
			<Spacer className='!h-4' />

			<div className='card'>
				<div className='w-full flex justify-between items-center'>
					<div>
						<FormHeader
							title='Transactions'
							titleClassName='!font-semibold'
							variant='form-title'
							subtitle='Assign a name to your event schema '
						/>
					</div>
					<div className='flex items-center space-x-2	'>
						<button className='px-2 py-1'>
							<IoSearch className='size-4 text-[#09090B] ' />
						</button>
						<button className='px-2 py-1'>
							<LiaSlidersHSolid className='size-4 text-[#09090B] ' />
						</button>
					</div>
				</div>
				<Spacer className='!h-6' />
				<WalletTransactionsTable data={transactionsData?.transactions || []} />
				<Pagination totalPages={Math.ceil((transactionsData?.total ?? 1) / limit)} />
			</div>
		</div>
	);
};

export default Wallet;
