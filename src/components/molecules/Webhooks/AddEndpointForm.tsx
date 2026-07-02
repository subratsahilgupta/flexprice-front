import { FC, useMemo, useState } from 'react';
import { useSvix, useEventTypes } from 'svix-react';
import { ChevronRight } from 'lucide-react';
import { Button, Checkbox, Input, Textarea } from '@/components/atoms';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { groupEventTypesByPrefix } from './eventTypeGroups';

interface Props {
	onBack: () => void;
	onCreated: () => void;
	onViewEventCatalog: () => void;
}

const AddEndpointForm: FC<Props> = ({ onBack, onCreated, onViewEventCatalog }) => {
	const { t } = useTranslation(['developers', 'common']);
	const { svix, appId } = useSvix();
	const eventTypes = useEventTypes({ limit: 250 });
	const [url, setUrl] = useState('');
	const [description, setDescription] = useState('');
	const [eventSearch, setEventSearch] = useState('');
	const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
	const [submitting, setSubmitting] = useState(false);

	const groups = useMemo(() => groupEventTypesByPrefix(eventTypes.data ?? []), [eventTypes.data]);
	const filteredGroups = useMemo(() => {
		if (!eventSearch) return groups;
		const query = eventSearch.toLowerCase();
		return groups
			.map((group) => ({ ...group, eventTypes: group.eventTypes.filter((e) => e.name.toLowerCase().includes(query)) }))
			.filter((group) => group.eventTypes.length > 0 || group.name.toLowerCase().includes(query));
	}, [groups, eventSearch]);

	const toggleEvent = (name: string) => {
		setSelectedEvents((prev) => (prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]));
	};

	const toggleGroup = (groupEvents: string[], allSelected: boolean) => {
		setSelectedEvents((prev) =>
			allSelected ? prev.filter((e) => !groupEvents.includes(e)) : [...new Set([...prev, ...groupEvents])],
		);
	};

	const handleSubmit = async () => {
		if (!url) return;
		setSubmitting(true);
		try {
			// svix-react's useNewEndpoint always sends filterTypes: [], which Svix
			// rejects as invalid, so the endpoint is created directly via the svix client
			// and filterTypes is omitted entirely when no event types are selected.
			await svix.endpoint.create(appId, {
				url,
				description: description || undefined,
				filterTypes: selectedEvents.length ? selectedEvents : undefined,
				version: 1,
			});
			toast.success(t('webhooks.endpoints.form.addSuccess'));
			onCreated();
		} catch {
			toast.error(t('webhooks.endpoints.form.addFailed'));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex items-center gap-1.5 text-sm text-gray-500'>
				<button className='hover:text-gray-900' onClick={onBack}>
					{t('webhooks.endpoints.heading')}
				</button>
				<ChevronRight className='w-3.5 h-3.5' />
				<span className='text-gray-900 font-medium'>{t('webhooks.endpoints.form.newEndpointTitle')}</span>
			</div>

			<div className='flex flex-col gap-2'>
				<Input
					label={t('webhooks.endpoints.form.urlLabel')}
					placeholder={t('webhooks.endpoints.form.urlPlaceholder')}
					value={url}
					onChange={setUrl}
				/>
				<p className='text-sm text-gray-500'>{t('webhooks.endpoints.form.urlHint')}</p>
			</div>

			<Textarea
				label={t('webhooks.endpoints.form.descriptionLabel')}
				placeholder={t('webhooks.endpoints.form.descriptionPlaceholder')}
				value={description}
				onChange={setDescription}
			/>

			<div className='flex flex-col gap-3'>
				<div className='flex items-center justify-between'>
					<h4 className='text-sm font-medium'>{t('webhooks.endpoints.form.subscribeToEvents')}</h4>
					<button className='flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900' onClick={onViewEventCatalog}>
						{t('webhooks.tabs.eventCatalog')}
						<ChevronRight className='w-3.5 h-3.5' />
					</button>
				</div>

				<Input
					placeholder={t('webhooks.endpoints.form.searchEventsPlaceholder')}
					value={eventSearch}
					onChange={setEventSearch}
				/>

				<div className='border rounded-md divide-y divide-border max-h-80 overflow-y-auto'>
					{filteredGroups.map((group) => {
						const groupEventNames = group.eventTypes.map((e) => e.name);
						const allSelected = groupEventNames.length > 0 && groupEventNames.every((name) => selectedEvents.includes(name));
						return (
							<div key={group.name} className='p-3'>
								<Checkbox
									id={`group-${group.name}`}
									checked={allSelected}
									onCheckedChange={() => toggleGroup(groupEventNames, allSelected)}
									label={group.name}
								/>
								<div className='flex flex-col gap-2 mt-2 ms-6'>
									{group.eventTypes.map((eventType) => (
										<Checkbox
											key={eventType.name}
											id={`event-${eventType.name}`}
											checked={selectedEvents.includes(eventType.name)}
											onCheckedChange={() => toggleEvent(eventType.name)}
											label={eventType.name}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className='flex gap-3'>
				<Button isLoading={submitting} disabled={submitting || !url} onClick={handleSubmit}>
					{submitting ? t('webhooks.endpoints.form.submitting') : t('webhooks.endpoints.form.submit')}
				</Button>
				<Button variant='outline' disabled={submitting} onClick={onBack}>
					{t('common:actions.cancel')}
				</Button>
			</div>
		</div>
	);
};

export default AddEndpointForm;
