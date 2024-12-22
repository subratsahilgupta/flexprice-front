'use client';

import { ChevronRight } from 'lucide-react';
import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar';

type NavItem = {
	title: string;
	url: string;
	icon?: FC;
	isActive?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
};

const SidebarNav: FC<{ items: NavItem[] }> = ({ items }) => {
	const navigate = useNavigate();

	const handleNavigation = (url: string, hasChildren: boolean) => {
		if (url && !hasChildren) {
			navigate(url);
		}
	};

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Navigation</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					const hasChildren = item.items && item.items.length > 0;

					return (
						<Collapsible key={item.title} asChild defaultOpen={item.isActive} className='group/collapsible'>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton
										onClick={() => {
											handleNavigation(item.url, !!hasChildren);
										}}
										tooltip={item.title}
										className={`flex items-center gap-2 hover:bg-muted transition-colors ${
											item.isActive ? 'bg-accent text-accent-foreground' : ''
										}`}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
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
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default SidebarNav;
