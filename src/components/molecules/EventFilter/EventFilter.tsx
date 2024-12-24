import { Button, Input } from '@/components/atoms';
import React, { FC } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';

interface Props {
	eventFilters: EventFilterData[];
	setEventFilters: React.Dispatch<React.SetStateAction<EventFilterData[]>>;
}

export interface EventFilterData {
	key: string;
	value: string[];
}

const EventFilter: FC<Props> = ({ eventFilters, setEventFilters }) => {
	return (
		<div>
			<div className='flex flex-col gap-2 mb-4 px-6'>
				{eventFilters.map((eventFilter, index) => {
					return (
						<div key={index} className='flex h-full w-full  gap-4'>
							<Input
								type='text'
								label='Key'
								placeholder='key'
								value={eventFilter.key}
								onChange={(e) => {
									const newEventFilters = [...eventFilters];
									newEventFilters[index].key = e;
									setEventFilters(newEventFilters);
								}}
							/>
							<Input
								type='text'
								label='Values'
								placeholder='value'
								value={eventFilter.value.join(',')}
								onChange={(e) => {
									const newEventFilters = [...eventFilters];
									newEventFilters[index].value = e.split(',');
									setEventFilters(newEventFilters);
								}}
							/>
							<div className='flex  items-end  gap-4'>
								<button
									className='flex justify-center items-center w-10 h-10 rounded-md border text-zinc'
									onClick={() => {
										const newEventFilters = [...eventFilters];
										newEventFilters.splice(index, 1);
										setEventFilters(newEventFilters);
									}}>
									<RiDeleteBin6Line className='text-zinc' />
								</button>
							</div>
						</div>
					);
				})}
			</div>
			<div className='px-6'>
				<Button
					variant={'outline'}
					onClick={() => {
						setEventFilters([...eventFilters, { key: '', value: [] }]);
					}}>
					Add Event Filter
				</Button>
			</div>
		</div>
	);
};

export default EventFilter;
