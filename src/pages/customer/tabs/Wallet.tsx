import { AddButton, Button, Card, CardHeader, Chip, FormHeader, Modal, Select, ShortPagination, Spacer } from '@/components/atoms';
import { DropdownMenu, DropdownMenuOption, TopupCard, WalletTransactionsTable } from '@/components/molecules';
import { Skeleton } from '@/components/ui/skeleton';
import usePagination from '@/hooks/usePagination';
import { Wallet } from '@/models/Wallet';
import WalletApi from '@/utils/api_requests/WalletApi';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoSearch } from 'react-icons/io5';
import { useParams } from 'react-router-dom';
import CreateWallet from '../customers/CreateWallet';
import { CircleFadingPlus, EllipsisVertical, Pencil, SlidersHorizontal, Trash2, Wallet as WalletIcon } from 'lucide-react';
import { getCurrencySymbol } from '@/utils/common/helper_functions';
import useQueryParams from '@/hooks/useQueryParams';
import { DetailsCard } from '@/components/molecules';
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

const WalletTab = () => {
	const { id: customerId } = useParams();
	const [activeWallet, setActiveWallet] = useState<Wallet | null>();
	const { limit, offset } = usePagination();
	const {
		queryParams: { activeWalletId },
		setQueryParam,
	} = useQueryParams<{ activeWalletId?: string }>({ activeWalletId: '' });

	const [isAdd, setisAdd] = useState(false);
	const [showTopupModal, setshowTopupModal] = useState(false);
	const dropdownOptions: DropdownMenuOption[] = [
		{
			icon: <WalletIcon />,
			label: 'Create Wallet',
			onSelect: () => setisAdd(true),
		},
		{
			icon: <CircleFadingPlus />,
			label: 'Topup Wallet',
			onSelect: () => setshowTopupModal(true),
		},
		{
			icon: <Pencil />,
			label: 'Edit',
			disabled: true,
		},
		{
			icon: <Trash2 />,
			label: 'Delete',
			disabled: true,
		},
	];

	const {
		data: wallets,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchWallets', customerId],
		queryFn: async () => {
			return await WalletApi.getWallets(customerId!);
		},
		enabled: !!customerId,
	});

	const { data: walletBalance, isLoading: isBalanceLoading } = useQuery({
		queryKey: ['fetchWalletBalances', customerId, activeWallet?.id],
		queryFn: async () => {
			return await WalletApi.getWalletBalance(activeWallet ? activeWallet.id : '');
		},
		enabled: !!customerId && !!activeWallet,
	});

	const {
		data: transactionsData,
		isLoading: isTransactionLoading,
		isError: isTransactionError,
	} = useQuery({
		queryKey: ['fetchWalletsTransactions', customerId, activeWallet?.id],
		queryFn: async () => {
			return await WalletApi.getWalletTransactions({
				walletId: activeWallet ? activeWallet.id : '',
				limit,
				offset,
			});
		},
		enabled: !!customerId && !!activeWallet,
	});

	useEffect(() => {
		if (!wallets || wallets?.length === 0) {
			return;
		}

		if (activeWalletId === '' || !activeWalletId) {
			setQueryParam('activeWalletId', wallets[0].id);
			return;
		}

		const wallet = wallets.find((wallet) => wallet.id === activeWalletId) || wallets[0];

		setActiveWallet(wallet);
	}, [wallets, activeWalletId]);

	const walletOptions = wallets?.map((wallet, index) => ({
		label: wallet.name || `demo name ${index}`,
		value: wallet.id,
	}));

	if (isLoading || isTransactionLoading || isBalanceLoading) {
		return (
			<div className=' h-full   space-y-5'>
				<Skeleton className='w-full h-16' />
				<Skeleton className='w-full h-32' />
				<Skeleton className='w-full h-32' />
			</div>
		);
	}

	if (isError || isTransactionError) {
		toast.error('An error occurred while fetching wallet details');
	}

	if (isAdd) {
		return <CreateWallet isVisible={isAdd} onClose={(value) => setisAdd(value)} customerId={customerId!} />;
	}

	if (wallets?.length === 0) {
		return (
			<Card variant='notched'>
				<CardHeader title='Wallet' subtitle='No wallet linked to the customer yet' cta={<AddButton onClick={() => setisAdd(true)} />} />
			</Card>
		);
	}

	return (
		<div>
			{/* topup wallet */}
			<Modal isOpen={showTopupModal} onOpenChange={() => setshowTopupModal(false)}>
				<div className='w-[700px] bg-white rounded-xl'>
					<TopupCard onSuccess={() => setshowTopupModal(false)} walletId={activeWallet?.id} />
				</div>
			</Modal>

			<FormHeader
				className='!my-6'
				title='Wallets'
				subtitle='Manage credits for usage-based billing that can apply to invoices pre-tax'
				variant='sub-header'
			/>
			<div className='w-full flex justify-between items-center mb-3'>
				<div>
					{(walletOptions?.length ?? 0) > 1 && (
						<div className='min-w-[250px]'>
							<Select
								options={walletOptions || []}
								value={activeWallet?.id}
								onChange={(value) => {
									const selectedWallet = wallets?.find((wallet) => wallet.id === value) || null;
									setActiveWallet(selectedWallet);
									setQueryParam('activeWalletId', value);
								}}
							/>
						</div>
					)}
				</div>
				<div className='flex items-center space-x-2	'>
					{/* <Button onClick={() => setisAdd(true)}>
						<WalletIcon />
						<span>Add Wallet</span>
					</Button> */}

					<DropdownMenu
						options={dropdownOptions}
						trigger={<Button variant={'outline'} prefixIcon={<EllipsisVertical />} size={'icon'}></Button>}></DropdownMenu>
				</div>
			</div>
			{/* when we have wallets or active wallets */}
			{activeWallet && !isAdd && (
				<div>
					<DetailsCard
						variant='stacked'
						title='Wallet Details'
						data={[
							{ label: 'Wallet Name', value: activeWallet?.name || 'Prepaid wallet' },
							{
								label: 'Status',
								value: (
									<Chip
										variant={formatWalletStatus(activeWallet?.wallet_status) === 'Active' ? 'success' : 'default'}
										label={formatWalletStatus(activeWallet?.wallet_status)}
									/>
								),
							},
						]}
					/>
					<Spacer className='!h-4' />

					{/* wallet moneyy */}
					{isBalanceLoading ? (
						<Skeleton className='w-full h-[200px]' />
					) : (
						<div className='w-full grid grid-cols-2 gap-4'>
							<div className='card w-full'>
								<p className='text-[#71717A] text-sm'>Current Balance</p>
								<Spacer className='!my-2' />
								<p className='text-[#09090B] font-semibold text-3xl '>
									{getCurrencySymbol(walletBalance?.currency ?? '')}
									{walletBalance?.balance}
								</p>
							</div>
							<div className='card w-full'>
								<p className='text-[#71717A] text-sm'>Ongoing Balance</p>
								<Spacer className='!my-2' />
								<p className='text-[#09090B] font-semibold text-3xl '>
									{getCurrencySymbol(walletBalance?.currency ?? '')}
									{walletBalance?.real_time_balance}
								</p>
							</div>
						</div>
					)}
					<Spacer className='!h-4' />
					{transactionsData?.items.length === 0 ? (
						<div className='card'>
							<FormHeader title='No transactions found' variant='sub-header' subtitle='No recent transactions' />
						</div>
					) : (
						<div className='card'>
							<div className='w-full flex justify-between items-center'>
								<div>
									<FormHeader title='Transactions' titleClassName='!font-semibold' variant='form-title' />
								</div>
								<div className='flex items-center space-x-2	'>
									<button className='px-2 py-1'>
										<IoSearch className='size-4 text-[#09090B] ' />
									</button>
									<button className='px-2 py-1'>
										<SlidersHorizontal className='size-4 text-[#09090B] ' />
									</button>
								</div>
							</div>
							<Spacer className='!h-6' />
							<WalletTransactionsTable data={transactionsData?.items || []} />
							<ShortPagination unit='Transactions' totalItems={transactionsData?.pagination.total ?? 0} />
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default WalletTab;
