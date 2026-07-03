import { FC, useState } from 'react';
import { useMessage, useMessageAttempts } from 'svix-react';
import type { MessageAttemptOut } from 'svix';
import { Loader, NoDataCard, Toggle } from '@/components/atoms';
import CodeBlock from '@/components/atoms/CodeBlock';
import FlexpriceTable, { ColumnData } from '@/components/molecules/Table';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import formatDate from '@/utils/common/format_date';
import {
	AttemptStatusChip,
	AttemptReplayAction,
	ATTEMPT_STATUS_FILTERS,
	AttemptStatusFilterKey,
	AttemptStatusFilters,
} from './AttemptStatus';

interface Props {
	messageId: string;
	backLabel: string;
	onBack: () => void;
}

const MessageDetail: FC<Props> = ({ messageId, backLabel, onBack }) => {
	const { t } = useTranslation('developers');
	const message = useMessage(messageId);
	const [showRaw, setShowRaw] = useState(false);
	const [filter, setFilter] = useState<AttemptStatusFilterKey>('all');
	const activeFilter = ATTEMPT_STATUS_FILTERS.find((f) => f.key === filter) ?? ATTEMPT_STATUS_FILTERS[0];
	const attempts = useMessageAttempts(messageId, { status: activeFilter.status });

	const attemptColumns: ColumnData<MessageAttemptOut>[] = [
		{
			title: t('webhooks.endpoints.attempts.columns.status'),
			render: (row) => <AttemptStatusChip status={row.status} />,
		},
		{
			title: t('webhooks.messages.attempts.columns.url'),
			render: (row) => <span className='truncate text-sm text-gray-600'>{row.url}</span>,
		},
		{
			title: t('webhooks.endpoints.attempts.columns.timestamp'),
			render: (row) => <span className='text-sm text-gray-500'>{formatDate(row.timestamp)}</span>,
		},
		{
			title: t('webhooks.endpoints.attempts.columns.replay'),
			align: 'right',
			render: (row) => <AttemptReplayAction attempt={row} onReplayed={attempts.reload} />,
		},
	];

	if (message.loading && !message.data) {
		return (
			<div className='flex h-64 items-center justify-center'>
				<Loader />
			</div>
		);
	}

	if (message.error || !message.data) {
		return <div className='p-4 text-sm text-red-600'>{t('webhooks.messages.loadFailed')}</div>;
	}

	const content = message.data.payload;

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex items-center gap-1.5 text-sm text-gray-500'>
				<button className='hover:text-gray-900' onClick={onBack}>
					{backLabel}
				</button>
				<ChevronRight className='w-3.5 h-3.5' />
				<span className='text-gray-900 font-medium font-mono'>{messageId}</span>
			</div>

			<div className='grid grid-cols-[1fr_260px] gap-8'>
				<div className='flex flex-col gap-2 min-w-0'>
					<h3 className='text-lg font-medium'>{message.data.eventType}</h3>

					<div className='flex items-center justify-between mt-2'>
						<h4 className='text-sm font-medium'>{t('webhooks.messages.content')}</h4>
						<Toggle checked={showRaw} onChange={setShowRaw} label={t('webhooks.messages.raw')} />
					</div>
					<div className='border border-border rounded-md overflow-hidden'>
						<CodeBlock language='json' code={showRaw ? JSON.stringify(content) : JSON.stringify(content, null, 2)} />
					</div>
				</div>

				<div className='flex flex-col gap-4'>
					<div>
						<h4 className='text-sm font-medium text-gray-500'>{t('webhooks.messages.createdAt')}</h4>
						<p className='text-sm mt-1'>{formatDate(message.data.timestamp)}</p>
					</div>
				</div>
			</div>

			<div className='flex flex-col gap-3'>
				<div className='flex items-center justify-between'>
					<h4 className='text-sm font-medium'>{t('webhooks.messages.attempts.heading')}</h4>
					<AttemptStatusFilters active={filter} onChange={setFilter} />
				</div>

				{attempts.loading && !attempts.data ? (
					<div className='flex h-32 items-center justify-center'>
						<Loader />
					</div>
				) : attempts.data?.length ? (
					<FlexpriceTable columns={attemptColumns} data={attempts.data} />
				) : (
					<NoDataCard title={t('webhooks.messages.attempts.emptyTitle')} subtitle={t('webhooks.messages.attempts.empty')} />
				)}
			</div>
		</div>
	);
};

export default MessageDetail;
