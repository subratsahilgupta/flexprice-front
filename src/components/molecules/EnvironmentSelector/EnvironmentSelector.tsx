import { Select, SelectContent, SelectGroup } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SelectOption } from '@/components/atoms';
import { useQuery } from '@tanstack/react-query';
import EnvironmentApi from '@/utils/api_requests/EnvironmentApi';
import { Blocks, Rocket, Server, ChevronsUpDown } from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';

const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cn(
			'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
			className,
		)}
		{...props}>
		{children}
		<SelectPrimitive.Icon asChild>
			<ChevronsUpDown className='h-4 w-4 opacity-50' />
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
));

const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(
			'relative flex w-full cursor-default select-none items-center rounded-sm py-[2px] px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
			'data-[state=checked]:bg-gray-100',
			className,
		)}
		{...props}>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
));

interface Props {
	disabled?: boolean;
	className?: string;
	noOptionsText?: string;
}

const FlexPriceSelect: React.FC<Props> = ({ disabled = false, className }) => {
	const { data: environments, isLoading } = useQuery({
		queryKey: ['environments'],
		queryFn: () => EnvironmentApi.getLocalEnvironments(),
		// Enable this when ready to use real API
		enabled: false,
	});

	if (isLoading)
		return (
			<div>
				<Skeleton className='h-10 w-full' />
			</div>
		);

	// Use real environments data when available, fallback to test data
	const environmentsList = environments || [
		{
			id: 'production',
			name: 'Production',
			slug: 'production',
			type: 'production',
			created_at: '2021-01-01',
			updated_at: '2021-01-01',
			isActive: true,
		},
		{
			id: 'sandbox',
			name: 'Sandbox',
			slug: 'sandbox',
			type: 'sandbox',
			created_at: '2021-01-01',
			updated_at: '2021-01-01',
			isActive: false,
		},
	];

	const getEnvironmentIcon = (type: string) => {
		switch (type) {
			case 'production':
				return <Rocket className='h-4 w-4' />;
			case 'sandbox':
				return <Server className='h-4 w-4' />;
			default:
				return <Blocks className='h-4 w-4' />;
		}
	};

	const options: SelectOption[] = environmentsList.map((env) => ({
		value: env.id,
		label: env.name,
		prefixIcon: getEnvironmentIcon(env.type),
		// description: env.type === 'production' ? 'Live Environment' : 'Testing Environment',
	}));

	const activeEnvironment = environmentsList.find((env) => env.isActive);

	return (
		<div className={cn('mt-1', className)}>
			<Select
				defaultValue={activeEnvironment?.id || ''}
				onValueChange={(newValue) => {
					EnvironmentApi.setActiveEnvironment(newValue);
				}}
				value={activeEnvironment?.id || ''}
				disabled={disabled}>
				<SelectTrigger className={cn('gap-2 bg-white', !disabled && 'cursor-pointer')}>
					<span className={cn('truncate ', activeEnvironment?.id ? '' : 'text-muted-foreground')}>
						<div className='flex flex-row items-center gap-2 text-zinc-500'>
							<span className='size-4 text-muted-foreground'>
								{options.find((option) => option.value === activeEnvironment?.id)?.prefixIcon}
							</span>
							{activeEnvironment?.name || 'Select Environment'}
						</div>
					</span>
				</SelectTrigger>
				<SelectContent className='p-1'>
					<SelectGroup>
						<span className='!mb-2 text-muted-foreground text-xs font-medium'>Switch Environment</span>
						{options.length > 0 &&
							options.map((option) => (
								<SelectItem
									className={cn(
										'cursor-pointer hover:bg-gray-50',
										'flex items-center space-x-2 justify-between w-full rounded-md',
										'transition-colors duration-150 ease-in-out',
									)}
									disabled={option.disabled}
									key={option.value}
									value={option.value}>
									<div className={cn('flex w-full items-center gap-3 px-1 py-1', option.disabled && 'opacity-50 pointer-events-none')}>
										<span className='text-muted-foreground shrink-0 size-4'>{option.prefixIcon}</span>
										<div className='flex flex-col min-w-0 text-muted-foreground'>
											<span className=' truncate'>{option.label}</span>
											{option.description && <span className='text-xs text-muted-foreground truncate'>{option.description}</span>}
										</div>
									</div>
								</SelectItem>
							))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
};

export default FlexPriceSelect;
