import { FC } from 'react';
import { NavItem } from './SidebarMenu';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const SidebarItem: FC<NavItem> = (item) => {
	const navigate = useNavigate();
	const location = useLocation();

	const handleNavigation = (url: string, hasChildren: boolean) => {
		if (url && !hasChildren) {
			navigate(url);
		}
	};

	const hasChildren = item.items && item.items.length > 0;
	const Icon = item.icon;

	const isMainItemActive = item.isActive;
	const iconActive = isMainItemActive;

	return (
		<Collapsible key={item.title} asChild defaultOpen={item.isActive} className='group/collapsible'>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton
						disabled={item.disabled}
						onClick={() => handleNavigation(item.url, !!hasChildren)}
						tooltip={item.title}
						className={cn(
							'flex items-center gap-2 h-12 px-4 rounded-[6px] text-[14px] cursor-pointer',
							isMainItemActive ? 'bg-[#F4F4F5] font-medium' : 'font-normal',
							item.disabled && 'cursor-not-allowed opacity-50',
						)}>
						{Icon && <Icon className={cn('!size-5 mr-1', iconActive ? 'text-[#3C87D2]' : 'text-[#3F3F46]')} />}
						<span className='text-[14px] select-none'>{item.title}</span>
						{hasChildren && (
							<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
						)}
					</SidebarMenuButton>
				</CollapsibleTrigger>
				{hasChildren && (
					<CollapsibleContent>
						<SidebarMenuSub className='gap-0'>
							{item.items?.map((subItem) => {
								const subActive = location.pathname.startsWith(subItem.url);
								return (
									<SidebarMenuSubItem key={subItem.title}>
										<SidebarMenuSubButton asChild={false} isActive={subActive} className='w-full' onClick={() => navigate(subItem.url)}>
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
