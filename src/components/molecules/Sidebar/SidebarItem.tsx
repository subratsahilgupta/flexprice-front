import { FC } from 'react';
import { NavItem } from './SidebarMenu';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { cn } from '@/lib/utils';

const SidebarItem: FC<NavItem> = (item) => {
	const navigate = useNavigate();

	const handleNavigation = (url: string, hasChildren: boolean) => {
		if (url && !hasChildren) {
			navigate(url);
		}
	};
	const hasChildren = item.items && item.items.length > 0;
	return (
		<Collapsible key={item.title} asChild defaultOpen={item.isActive} className='group/collapsible'>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton
						disabled={item.disabled}
						onClick={() => {
							handleNavigation(item.url, !!hasChildren);
						}}
						tooltip={item.title}
						className={cn(
							`flex items-center gap-2 hover:bg-muted transition-colors `,
							item.isActive && 'bg-[#F4F4F5] font-medium text-sidebar-text-accent-foreground',
							item.disabled && 'cursor-not-allowed',
						)}>
						{typeof item.icon === 'string' && <ReactSVG src={item.icon} className='size-4' />}
						{typeof item.icon === 'object' && item.icon}
						<span className='text-sm select-none'>{item.title}</span>
						{hasChildren && (
							<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
						)}
					</SidebarMenuButton>
				</CollapsibleTrigger>
				{hasChildren && (
					<CollapsibleContent>
						<SidebarMenuSub>
							{item.items?.map((subItem) => (
								<SidebarMenuSubItem key={subItem.title}>
									<SidebarMenuSubButton asChild>
										<Link to={subItem.url} className='block w-full px-4 py-2 text-sm hover:bg-muted transition-colors'>
											{subItem.title}
										</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				)}
			</SidebarMenuItem>
		</Collapsible>
	);
};

export default SidebarItem;
