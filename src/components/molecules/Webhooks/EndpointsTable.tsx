import { FC, useState } from 'react';
import { useEndpoints, useEndpointStats } from 'svix-react';
import type { EndpointOut } from 'svix';
import { AddButton, Button, Loader, NoDataCard } from '@/components/atoms';
import FlexpriceTable, { ColumnData } from '@/components/molecules/Table';
import { useTranslation } from 'react-i18next';
import AddEndpointForm from './AddEndpointForm';
import EndpointDetail from './EndpointDetail';

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
	const [view, setView] = useState<'list' | 'new' | 'detail'>('list');
	const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);

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

	if (view === 'detail' && selectedEndpointId) {
		return (
			<EndpointDetail
				endpointId={selectedEndpointId}
				onBack={() => setView('list')}
				onDeleted={() => {
					endpoints.reload();
					setView('list');
				}}
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

	const openDetail = (endpointId: string) => {
		setSelectedEndpointId(endpointId);
		setView('detail');
	};

	const columns: ColumnData<EndpointOut>[] = [
		{
			title: t('webhooks.endpoints.columns.endpoint'),
			render: (row) => (
				<div className='min-w-0'>
					<div className='truncate font-medium text-sm'>{row.url}</div>
					{row.description && <div className='truncate text-xs text-gray-500'>{row.description}</div>}
				</div>
			),
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
				<FlexpriceTable columns={columns} data={endpoints.data} onRowClick={(row) => openDetail(row.id)} />
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

export default EndpointsTable;
