import { Button, Page } from '@/components/atoms';
import { ColumnData, DropdownMenu, FlexpriceTable, Pagination, SecretKeyDrawer } from '@/components/molecules';
import SecretKeysApi from '@/utils/api_requests/SecretKeysApi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SecretKey } from '@/models/SecretKey';
import usePagination from '@/hooks/usePagination';
import { formatDateShort } from '@/utils/common/helper_functions';
import { Plus, Eye, Pencil, EyeOff, LucideIcon, ShieldCheck, Key } from 'lucide-react';
import { useState } from 'react';
import { refetchQueries } from '@/core/tanstack/ReactQueryProvider';

// Utility function to format permissions for display
export const formatPermissionDisplay = (permissions: readonly string[]): string => {
	const hasRead = permissions.includes('read');
	const hasWrite = permissions.includes('write');

	if (hasRead && hasWrite) {
		return 'full access';
	} else if (hasRead) {
		return 'read';
	} else if (hasWrite) {
		return 'write';
	} else {
		return 'none';
	}
};

// Utility function to get permission icon based on permission level
export const getPermissionIcon = (permissions: readonly string[]): LucideIcon => {
	const hasRead = permissions.includes('read');
	const hasWrite = permissions.includes('write');

	if (hasRead && hasWrite) {
		return ShieldCheck; // Full access icon
	} else if (hasRead) {
		return Eye; // Read only icon
	} else if (hasWrite) {
		return Pencil; // Write only icon
	} else {
		return EyeOff; // No access icon
	}
};

// Utility function to get color based on permission level
export const getPermissionColor = (permissions: readonly string[]): string => {
	const hasRead = permissions.includes('read');
	const hasWrite = permissions.includes('write');

	if (hasRead && hasWrite) {
		return 'text-green-600'; // Full access color
	} else if (hasRead) {
		return 'text-blue-600'; // Read only color
	} else if (hasWrite) {
		return 'text-amber-600'; // Write only color
	} else {
		return 'text-gray-500'; // No access color
	}
};

const baseColumns: ColumnData<SecretKey>[] = [
	{
		title: 'Name',
		render(rowData: SecretKey) {
			return (
				<div className='flex items-center gap-2 font-medium'>
					<span>{rowData.name}</span>
				</div>
			);
		},
	},
	{
		title: 'Token',
		render(rowData: SecretKey) {
			return (
				<div className='flex items-center gap-2'>
					<div className='bg-gray-100 px-3 py-1 rounded-md font-mono text-sm flex items-center'>
						<Key size={14} className='mr-2 text-gray-600' />
						<span className='text-gray-700'>{rowData.display_id}</span>
					</div>
				</div>
			);
		},
	},
	{
		title: 'Permissions',
		render(rowData) {
			const permissionText = formatPermissionDisplay(rowData.permissions);
			const PermissionIcon = getPermissionIcon(rowData.permissions);
			const colorClass = getPermissionColor(rowData.permissions);

			return (
				<div className={`flex items-center gap-2 ${colorClass}`}>
					<PermissionIcon size={16} />
					<span className='capitalize font-medium'>{permissionText}</span>
				</div>
			);
		},
	},
	{
		title: 'Created At',
		width: 150,
		align: 'right',
		render(rowData) {
			return <span className='text-gray-600'>{formatDateShort(rowData.created_at)}</span>;
		},
	},
];

const DeveloperPage = () => {
	const { page, limit, offset } = usePagination();

	const { data: secretKeys } = useQuery({
		queryKey: ['secret-keys', page, limit, offset],
		queryFn: () => SecretKeysApi.getAllSecretKeys({ limit, offset }),
	});

	const { mutate: deleteSecretKey, isPending: isDeletingSecretKey } = useMutation({
		mutationFn: (id: string) => SecretKeysApi.deleteSecretKey(id),
		onSuccess: () => {
			refetchQueries(['secret-keys']);
		},
	});

	const [isSecretKeyDrawerOpen, setIsSecretKeyDrawerOpen] = useState(false);

	const handleAddSecretKey = () => {
		setIsSecretKeyDrawerOpen(true);
	};

	const columns: ColumnData<SecretKey>[] = [
		...baseColumns,
		{
			width: 50,
			align: 'right',
			render(rowData: SecretKey) {
				return (
					<div className='flex justify-end'>
						<DropdownMenu
							options={[
								{
									label: 'Delete',
									onSelect: () => deleteSecretKey(rowData.id),
									disabled: isDeletingSecretKey,
									icon: <EyeOff size={16} />,
								},
							]}
						/>
					</div>
				);
			},
		},
	];
	console.log(secretKeys);

	return (
		<Page
			heading='Developers'
			headingCTA={
				<Button prefixIcon={<Plus />} onClick={handleAddSecretKey}>
					Add
				</Button>
			}>
			<SecretKeyDrawer isOpen={isSecretKeyDrawerOpen} onOpenChange={setIsSecretKeyDrawerOpen} />
			<div>
				<FlexpriceTable showEmptyRow columns={columns} data={secretKeys?.items || []} />
				<Pagination totalPages={secretKeys?.pagination.total || 0} />
			</div>
		</Page>
	);
};

export default DeveloperPage;
