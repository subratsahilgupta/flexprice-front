import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
	label?: string;
	description?: string;
	error?: string;
	type?: React.HTMLInputTypeAttribute;
	onChange?: (value: string) => void;
	disabled?: boolean;
	suffix?: React.ReactNode;
	className?: string;
	placeholder?: string;
	id?: string;
	inputPrefix?: React.ReactNode;
	labelClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			type,
			label,
			description,
			error,
			onChange,
			disabled,
			placeholder,
			suffix,
			id,
			value,
			inputPrefix,
			labelClassName: titleClassName,
		},
		ref,
	) => {
		return (
			<div className='space-y-1 w-full flex flex-col'>
				{/* Label */}
				{label && (
					<label className={cn('font-inter block text-sm font-medium', disabled ? 'text-zinc-500' : 'text-zinc-950', titleClassName)}>
						{label}
					</label>
				)}
				{/* Input */}
				<div
					className={cn(
						'w-full flex h-full  group min-h-9 items-center rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground disabled:opacity-50 md:text-sm disabled:cursor-not-allowed',
						error ? 'border-destructive' : 'border-input focus-within:ring-ring focus-within:ring-offset-2',
						'focus-within:border-black',
						className,
					)}>
					{inputPrefix && <div className='mr-2'>{inputPrefix}</div>}
					<input
						id={id}
						type={type}
						value={value}
						disabled={disabled}
						placeholder={placeholder}
						className={cn('peer flex-1 bg-transparent outline-none ring-0 focus:outline-none w-full', disabled && 'text-zinc-500')}
						onChange={(e) => {
							if (onChange) {
								onChange(e.target.value);
							}
						}}
						ref={ref}
					/>
					{suffix && <div className='ml-2'>{suffix}</div>}
				</div>
				{/* Description */}
				{description && <p className={cn('text-sm', disabled ? 'text-zinc-500' : 'text-muted-foreground')}>{description}</p>}
				{/* Error Message */}
				{error && <p className='text-sm text-destructive'>{error}</p>}
			</div>
		);
	},
);

Input.displayName = 'Input';

export default Input;
