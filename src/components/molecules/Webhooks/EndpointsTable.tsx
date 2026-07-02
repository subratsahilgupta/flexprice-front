import { FC, useState } from 'react';
import { useEndpoints, useEndpointFunctions, useEndpointSecret, useEndpointStats } from 'svix-react';
import type { EndpointOut } from 'svix';
import { AddButton, Button, Loader, NoDataCard } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '@/components/molecules/Table';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import AddEndpointForm from './AddEndpointForm';

interface Props {
	onViewEventCatalog: () => void;
}

const ErrorRateCell: FC<{ endpointId: string }> = ({ endpointId }) => {
	const { t } = useTranslation('developers');
	const { data, loading } = useEndpointStats(endpointId);
	if (loading || !data) return <span className='text-sm text-gray-400'>{t('labels.missingValue')}</span>;
	const total = (data.success ?? 0) + (data.fail ?? 0);
	const rate = total > 0 ? (((data.fail ?? 0) / total) * 100).toFixed(1) : '0.0';
	return <span className='text-sm text-gray-600'>{rate}%</span>;
};

const EndpointsTable: FC<Props> = ({ onViewEventCatalog }) => {
	const { t } = useTranslation(['developers', 'common']);
	const endpoints = useEndpoints();
	const [view, setView] = useState<'list' | 'new'>('list');

	if (view === 'new') {
		return (
			<AddEndpointForm
				onBack={() => setView('list')}
				onCreated={() => {
					endpoints.reload();
					setView('list');
				}}
				onViewEventCatalog={onViewEventCatalog}
			/>
		);
	}

	if (endpoints.loading && !endpoints.data) {
		return (
			<div className='flex h-64 items-center justify-center'>
				<Loader />
			</div>
		);
	}

	if (endpoints.error) {
		return <div className='p-4 text-sm text-red-600'>{t('webhooks.endpoints.loadFailed')}</div>;
	}

	const columns: ColumnData<EndpointOut>[] = [
		{
			title: t('webhooks.endpoints.columns.endpoint'),
			render: (row) => <EndpointCell endpoint={row} onDeleted={endpoints.reload} />,
		},
		{
			title: t('webhooks.endpoints.columns.errorRate'),
			align: 'right',
			render: (row) => <ErrorRateCell endpointId={row.id} />,
		},
	];

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<h3 className='text-lg font-medium'>{t('webhooks.endpoints.heading')}</h3>
				<AddButton label={t('webhooks.endpoints.addEndpoint')} onClick={() => setView('new')} />
			</div>

			{endpoints.data?.length ? (
				<FlexpriceTable columns={columns} data={endpoints.data} />
			) : (
				<NoDataCard
					title={t('webhooks.endpoints.empty.title')}
					subtitle={t('webhooks.endpoints.empty.subtitle')}
					cta={<AddButton label={t('webhooks.endpoints.addEndpoint')} onClick={() => setView('new')} />}
				/>
			)}

			{(endpoints.hasPrevPage || endpoints.hasNextPage) && (
				<div className='flex justify-end gap-2'>
					<Button variant='outline' disabled={!endpoints.hasPrevPage} onClick={endpoints.prevPage}>
						{t('common:pagination.previous')}
					</Button>
					<Button variant='outline' disabled={!endpoints.hasNextPage} onClick={endpoints.nextPage}>
						{t('common:pagination.next')}
					</Button>
				</div>
			)}
		</div>
	);
};

const EndpointCell: FC<{ endpoint: EndpointOut; onDeleted: () => void }> = ({ endpoint, onDeleted }) => {
	const { t } = useTranslation(['developers', 'common']);
	const { deleteEndpoint } = useEndpointFunctions(endpoint.id);
	const secret = useEndpointSecret(endpoint.id);
	const [showSecret, setShowSecret] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!window.confirm(t('webhooks.endpoints.deleteConfirm', { url: endpoint.url }))) return;
		setIsDeleting(true);
		try {
			await deleteEndpoint();
			toast.success(t('webhooks.endpoints.deleteSuccess'));
			onDeleted();
		} catch {
			toast.error(t('webhooks.endpoints.deleteFailed'));
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className='min-w-0 flex flex-col gap-1.5 py-1'>
			<div className='min-w-0'>
				<div className='truncate font-medium text-sm'>{endpoint.url}</div>
				{endpoint.description && <div className='truncate text-xs text-gray-500'>{endpoint.description}</div>}
			</div>

			{showSecret && (
				<div className='break-all font-mono text-xs text-gray-600 bg-gray-50 border border-border rounded px-2 py-1'>
					{secret.loading
						? t('webhooks.endpoints.secret.loading')
						: secret.error
							? t('webhooks.endpoints.secret.loadFailed')
							: secret.data?.key}
				</div>
			)}

			<div className='flex gap-2'>
				<Button
					variant='outline'
					size='sm'
					onClick={(e) => {
						e.stopPropagation();
						setShowSecret((prev) => !prev);
						if (!secret.data) secret.reload();
					}}>
					{showSecret ? t('webhooks.endpoints.secret.hide') : t('webhooks.endpoints.secret.reveal')}
				</Button>
				<Button variant='outline' size='sm' isLoading={isDeleting} onClick={handleDelete}>
					{t('common:actions.delete')}
				</Button>
			</div>
		</div>
	);
};

export default EndpointsTable;
