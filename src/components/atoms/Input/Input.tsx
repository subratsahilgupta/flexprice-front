import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
	label?: string;
	description?: string;
	error?: string;
	type?: React.HTMLInputTypeAttribute;
	onChange?: (value: string) => void;
	disabled?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, label, description, error, onChange, disabled, ...props }, ref) => {
		return (
			<div className='space-y-1 w-full flex flex-col '>
				{/* Label */}
				{label && (
					<label htmlFor={props.id} className={cn('font-inter block text-sm font-medium ', disabled ? 'text-zinc-950' : 'text-zinc-950')}>
						{label}
					</label>
				)}

				{/* Input */}
				<input
					type={type}
					disabled={disabled}
					className={cn(
						'flex min-h-9 w-full flex-grow rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
						error && 'border-destructive focus-visible:ring-destructive',
						className,
					)}
					onChange={(e) => {
						if (onChange) {
							onChange(e.target.value);
						}
					}}
					ref={ref}
					{...props}
				/>

				{/* Description */}
				{description && <p className={cn('text-sm ', disabled ? 'text-zinc-500' : 'text-muted-foreground')}>{description}</p>}

				{/* Error Message */}
				{error && <p className='text-sm text-destructive'>{error}</p>}
			</div>
		);
	},
);

Input.displayName = 'Input';

export default Input;
