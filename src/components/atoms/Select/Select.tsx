import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface Option {
	value: string;
	label: string;
	description?: string;
}

interface Props {
	options: Option[];
	selectedValue?: string;
	placeholder?: string;
	label?: string;
	description?: string;
	error?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
}

const FlexPriceSelect: React.FC<Props> = ({
	disabled = false,
	options,
	selectedValue,
	placeholder = 'Select an option',
	label = 'Options',
	description,
	onChange,
	error,
}) => {
	return (
		<div className='space-y-1'>
			{/* Label */}
			{label && (
				<label className={cn('font-inter block text-sm font-medium text-zinc', disabled ? 'text-zinc-500' : 'text-zinc-950')}>
					{label}
				</label>
			)}

			<Select
				defaultValue={selectedValue}
				onValueChange={(value) => {
					if (onChange) {
						onChange(value);
					}
				}}
				disabled={disabled}>
				<SelectTrigger className='w-full '>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{options.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								<div className='flex flex-col'>
									<span>{option.label}</span>
									{option.description && <span className='text-sm text-gray-500'>{option.description}</span>}
								</div>
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			{/* Description */}
			{description && <p className='text-sm text-muted-foreground'>{description}</p>}

			{/* Error Message */}
			{error && <p className='text-sm text-destructive'>{error}</p>}
		</div>
	);
};

export default FlexPriceSelect;
