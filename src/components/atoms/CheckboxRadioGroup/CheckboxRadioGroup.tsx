import { FC } from 'react';

interface CheckboxRadioGroupItem {
	label: string;
	value: string;
	description?: string;
}

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface Props {
	checkboxItems: CheckboxRadioGroupItem[];
	defaultValue?: CheckboxRadioGroupItem;
	onChange?: (value: CheckboxRadioGroupItem) => void;
	value?: CheckboxRadioGroupItem;
	title?: string;
}

const CheckboxRadioGroup: FC<Props> = ({ checkboxItems, defaultValue, onChange, title, value }) => {
	return (
		<div>
			{title && <p className='text-sm text-zinc-950 font-medium font-inter mb-2'>{title}</p>}
			<RadioGroup defaultValue={value?.value ?? defaultValue?.value} className=''>
				{checkboxItems.map((item, index) => (
					<div key={index} className='flex items-center gap-2'>
						<RadioGroupItem id={item.value} value={item.value} onChange={() => onChange && onChange(item)} className='peer' />

						<label htmlFor={item.value} className='cursor-pointer font-open-sans'>
							<p className='font-medium text-sm text-[#18181B] peer-checked:text-black'>{item.label}</p>
							{item.description && <p className='text-sm text-[#71717A] peer-checked:text-gray-700'>{item.description}</p>}
						</label>
					</div>
				))}
			</RadioGroup>
		</div>
	);
};

export default CheckboxRadioGroup;
