import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
	label?: string;
	description?: string;
	error?: string;
	placeholder?: string;
	onChange?: (value: string[]) => void;
}

const MultichipField = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, label, description, error, onChange, placeholder, ...props }, ref) => {
		const [chips, setchips] = useState<string[]>([]);
		const [inputText, setinputText] = useState('');

		return (
			<div className='space-y-1 w-full'>
				{label && (
					<label htmlFor={props.id} className='font-inter block text-sm font-medium text-zinc'>
						{label}
					</label>
				)}

				<div
					className={cn(
						'group flex flex-wrap gap-2 items-center rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
						error ? 'border-destructive ring-destructive' : 'border-input focus-within:ring-ring focus-within:ring-offset-2',
						className,
					)}>
					<input
						aria-label='Add a chip'
						value={inputText}
						type={type}
						placeholder={placeholder}
						className='peer w-auto flex-1 bg-transparent outline-none ring-0 focus:outline-none'
						onChange={(e) => setinputText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && inputText.trim()) {
								const trimmedText = inputText.trim();
								if (!chips.includes(trimmedText)) {
									const updatedChips = [...chips, trimmedText];
									setchips(updatedChips);
									onChange?.(updatedChips);
								}
								setinputText('');
							}
						}}
						ref={ref}
					/>
					{chips.map((chip, index) => (
						<span key={index} className='bg-[#F0F2F5] h-full text-background rounded-full px-2 py-1 flex items-center'>
							{chip}
							<button
								className='ml-2 text-destructive font-medium'
								onClick={() => {
									const updatedChips = chips.filter((_, i) => i !== index);
									setchips(updatedChips);
									onChange?.(updatedChips);
								}}>
								✕
							</button>
						</span>
					))}
				</div>

				{description && <p className='text-sm text-muted-foreground'>{description}</p>}
				{error && <p className='text-sm text-destructive'>{error}</p>}
			</div>
		);
	},
);

MultichipField.displayName = 'MultichipField';

export default MultichipField;
