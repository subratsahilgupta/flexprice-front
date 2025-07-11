import { FC, useState, useEffect } from 'react';
import { NavItem } from './SidebarMenu';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
// import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarItemProps extends NavItem {
	isOpen?: boolean;
	defaultOpen?: boolean;
}

const SidebarItem: FC<SidebarItemProps> = (item) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(item.defaultOpen || false);

	const hasChildren = item.items && item.items.length > 0;
	const Icon = item.icon;

	const isMainItemActive = item.isActive;
	const iconActive = isMainItemActive;

	// Update open state when route changes
	useEffect(() => {
		setIsOpen(item.defaultOpen || false);
	}, [item.defaultOpen, location.pathname]);

	const handleNavigation = (url: string, hasChildren: boolean) => {
		if (url && !hasChildren) {
			navigate(url);
		}
		if (hasChildren) {
			navigate(item.items?.[0].url || '#');
		}
	};

	const handleClick = () => {
		if (hasChildren) {
			// If item is collapsed, open it and navigate to first child
			if (!isOpen) {
				setIsOpen(true);
				navigate(item.items?.[0].url || '#');
			} else {
				// If already open, just toggle (close it)
				setIsOpen(false);
			}
		} else {
			handleNavigation(item.url, !!hasChildren);
		}
	};

	return (
		<Collapsible key={item.title} open={isOpen} onOpenChange={setIsOpen} asChild className='group/collapsible'>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton
						disabled={item.disabled}
						onClick={handleClick}
						tooltip={item.title}
						className={cn(
							'flex items-center gap-2 h-10 px-2  py-[10px] rounded-[6px] text-[14px] cursor-pointer font-normal',
							isMainItemActive ? 'bg-white shadow-sm font-medium' : 'font-thin',
							item.disabled && 'cursor-not-allowed opacity-50',
						)}>
						{Icon && (
							<Icon absoluteStrokeWidth className={cn('!size-5 !stroke-[1.5px] mr-1', iconActive ? 'text-[#3C87D2]' : 'text-[#3F3F46]')} />
						)}
						<span className='text-[14px] select-none font-normal'>{item.title}</span>
						{/* {hasChildren && (
							<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
						)} */}
					</SidebarMenuButton>
				</CollapsibleTrigger>
				{hasChildren && (
					<CollapsibleContent className='my-3'>
						<SidebarMenuSub className='gap-0'>
							{item.items?.map((subItem) => {
								const subActive = location.pathname.startsWith(subItem.url);
								return (
									<SidebarMenuSubItem key={subItem.title}>
										<SidebarMenuSubButton
											asChild={false}
											isActive={subActive}
											className={cn('w-full font-light text-black')}
											onClick={() => navigate(subItem.url)}>
											{subItem.title}
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								);
							})}
						</SidebarMenuSub>
					</CollapsibleContent>
				)}
			</SidebarMenuItem>
		</Collapsible>
	);
};

export default SidebarItem;
