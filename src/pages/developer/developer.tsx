import { Button, FormHeader, SectionHeader } from '@/components/atoms';
import { ColumnData, FlexpriceTable, Pagination } from '@/components/molecules';
import SecretKeysApi from '@/utils/api_requests/SecretKeysApi';
import { useQuery } from '@tanstack/react-query';
import { SecretKey } from '@/models/SecretKey';
import usePagination from '@/hooks/usePagination';
import { formatDateShort } from '@/utils/common/helper_functions';
import { Plus, Eye, Pencil, EyeOff, LucideIcon, ShieldCheck, Key } from 'lucide-react';

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

// Sample data for demonstration
const sampleSecretKeys: SecretKey[] = [
	{
		id: '1',
		name: 'Production API Key',
		display_id: 'sk_live_abcd1234efgh5678ijkl9012',
		permissions: ['read', 'write'],
		created_at: new Date().toISOString(),
		expires_at: new Date(Date.now() + 365 * 86400000).toISOString(), // 1 year from now
		last_used_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
		provider: 'flexprice',
		status: 'active',
		type: 'secret_key',
		updated_at: new Date().toISOString(),
	},
	{
		id: '2',
		name: 'Read-only API Key',
		display_id: 'sk_live_zxcv4321asdf9876qwer5432',
		permissions: ['read'],
		created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
		expires_at: new Date(Date.now() + 180 * 86400000).toISOString(), // 180 days from now
		last_used_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
		provider: 'flexprice',
		status: 'active',
		type: 'secret_key',
		updated_at: new Date(Date.now() - 86400000).toISOString(),
	},
	{
		id: '3',
		name: 'Write-only API Key',
		display_id: 'sk_live_mnbv7890poiu1234lkjh5678',
		permissions: ['write'],
		created_at: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
		expires_at: new Date(Date.now() + 90 * 86400000).toISOString(), // 90 days from now
		last_used_at: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
		provider: 'flexprice',
		status: 'active',
		type: 'secret_key',
		updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
	},
	{
		id: '4',
		name: 'Disabled API Key',
		display_id: 'sk_live_tyui6543ghjk3210fgbn7890',
		permissions: [],
		created_at: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 days ago
		expires_at: new Date(Date.now() - 1 * 86400000).toISOString(), // Expired yesterday
		last_used_at: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 days ago
		provider: 'flexprice',
		status: 'expired',
		type: 'secret_key',
		updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
	},
];

const columns: ColumnData<SecretKey>[] = [
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
						<span className='text-gray-700'>
							{rowData.display_id.slice(0, 8)}...{rowData.display_id.slice(-4)}
						</span>
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

	const handleAddSecretKey = () => {
		console.log('add secret key');
	};

	console.log(secretKeys);

	return (
		<div className='page'>
			<div className='w-2/3 flex flex-col gap-4'>
				<SectionHeader title='Developers' />
				<div className='w-full flex flex-col gap-4 card'>
					<div className='flex mb-4 justify-between items-center'>
						<FormHeader title='Api Keys' variant='sub-header' />
						<Button
							onClick={handleAddSecretKey}
							className='bg-primary text-white px-4 inline-flex items-center py-2 rounded-md hover:bg-primary-dark'>
							<Plus />
							Create Api Key
						</Button>
					</div>
					<FlexpriceTable columns={columns} data={sampleSecretKeys || []} />
					<Pagination totalPages={secretKeys?.pagination.total || 0} />
				</div>
			</div>
		</div>
	);
};

export default DeveloperPage;
