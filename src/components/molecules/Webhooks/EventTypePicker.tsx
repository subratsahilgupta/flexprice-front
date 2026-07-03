import { FC, useMemo, useState } from 'react';
import { useEventTypes } from 'svix-react';
import { Checkbox, Input } from '@/components/atoms';
import { useTranslation } from 'react-i18next';
import { groupEventTypesByPrefix } from './eventTypeGroups';

interface Props {
	selected: string[];
	onChange: (selected: string[]) => void;
	className?: string;
}

const EventTypePicker: FC<Props> = ({ selected, onChange, className }) => {
	const { t } = useTranslation('developers');
	const eventTypes = useEventTypes({ limit: 250 });
	const [search, setSearch] = useState('');

	const groups = useMemo(() => groupEventTypesByPrefix(eventTypes.data ?? []), [eventTypes.data]);
	const filteredGroups = useMemo(() => {
		if (!search) return groups;
		const query = search.toLowerCase();
		return groups
			.map((group) => ({ ...group, eventTypes: group.eventTypes.filter((e) => e.name.toLowerCase().includes(query)) }))
			.filter((group) => group.eventTypes.length > 0 || group.name.toLowerCase().includes(query));
	}, [groups, search]);

	const toggleEvent = (name: string) => {
		onChange(selected.includes(name) ? selected.filter((e) => e !== name) : [...selected, name]);
	};

	const toggleGroup = (groupEvents: string[], allSelected: boolean) => {
		onChange(allSelected ? selected.filter((e) => !groupEvents.includes(e)) : [...new Set([...selected, ...groupEvents])]);
	};

	return (
		<div className={className}>
			<Input placeholder={t('webhooks.endpoints.form.searchEventsPlaceholder')} value={search} onChange={setSearch} />
			<div className='border rounded-md divide-y divide-border max-h-80 overflow-y-auto mt-3'>
				{filteredGroups.map((group) => {
					const groupEventNames = group.eventTypes.map((e) => e.name);
					const allSelected = groupEventNames.length > 0 && groupEventNames.every((name) => selected.includes(name));
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
										checked={selected.includes(eventType.name)}
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
	);
};

export default EventTypePicker;
