import { Select, SelectContent, SelectGroup, SelectItem as ShadcnSelect, SelectTrigger } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Circle } from 'lucide-react';
import React from 'react';

export interface SelectOption {
	value: string;
	label: string;
	description?: string;
	disabled?: boolean;
}

interface Props {
	options: SelectOption[];
	value?: string;
	placeholder?: string;
	label?: string;
	description?: string;
	error?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
	isRadio?: boolean;
	className?: string;
	noOptionsText?: string;
}

const RadioSelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(
			'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
			className,
		)}
		{...props}>
		{/* Checkbox Icon - Show Empty when Not Selected, Filled when Selected */}
		<span className='absolute left-2 top-[10px] flex h-4 w-4  justify-center'>
			<SelectPrimitive.ItemIndicator className='flex items-center justify-center w-full h-full'>
				<Circle className='size-2 text-black fill-current' />
			</SelectPrimitive.ItemIndicator>
			{/* Default Unselected Checkbox */}
			<Circle className='size-4 text-gray-400 absolute' />
		</span>

		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
));

const FlexPriceSelect: React.FC<Props> = ({
	disabled = false,
	options,
	value,
	placeholder = 'Select an option',
	label = '',
	description,
	onChange,
	error,
	isRadio,
	className,
	noOptionsText,
}) => {
	return (
		<div className={cn('space-y-1 ')}>
			{/* Label */}
			{label && (
				<label className={cn('font-inter block text-sm font-medium text-zinc', disabled ? 'text-zinc-500' : 'text-zinc-950')}>
					{label}
				</label>
			)}

			<Select
				defaultValue={value}
				onValueChange={(value) => {
					if (onChange) {
						onChange(value);
					}
				}}
				value={value}
				disabled={disabled}>
				<SelectTrigger className={cn(disabled && 'cursor-not-allowed', className)}>
					{
						<span className={cn(value ? '' : 'text-muted-foreground')}>
							{value ? options.find((option) => option.value === value)?.label : placeholder}
						</span>
					}
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{options.length > 0 &&
							options.map((option) => {
								if (isRadio) {
									return (
										<RadioSelectItem
											className={cn(option.disabled && 'select-none cursor-not-allowed')}
											disabled={option.disabled}
											key={option.value}
											value={option.value}>
											<div className='flex items-center space-x-2'>
												<div className='flex flex-col mr-2'>
													<span>{option.label}</span>
													{option.description && <span className='text-sm text-gray-500'>{option.description}</span>}
												</div>
											</div>
										</RadioSelectItem>
									);
								} else {
									return (
										<ShadcnSelect
											className={cn(option.disabled && 'select-none cursor-not-allowed')}
											disabled={option.disabled}
											key={option.value}
											value={option.value}>
											<div className='flex items-center space-x-2'>
												<div className='flex flex-col mr-2'>
													<span>{option.label}</span>
													{option.description && <span className='text-sm text-gray-500'>{option.description}</span>}
												</div>
											</div>
										</ShadcnSelect>
									);
								}
							})}
						{options.length === 0 && noOptionsText && (
							<ShadcnSelect value='no-items' disabled>
								<div className='flex items-center space-x-2'>
									<div className='flex flex-col mr-2'>
										<span>{noOptionsText}</span>
									</div>
								</div>
							</ShadcnSelect>
						)}
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
