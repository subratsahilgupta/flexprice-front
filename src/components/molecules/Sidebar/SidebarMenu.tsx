'use client';

import { FC } from 'react';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import SidebarItem from './SidebarItem';
import { useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

export type NavItem = {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	disabled?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
};

const SidebarNav: FC<{ items: NavItem[]; title: string }> = ({ items, title }) => {
	const location = useLocation();

	return (
		<SidebarGroup className='mb-0'>
			<SidebarGroupLabel className='text-xs mt-0 text-[#334155B2] font-medium '>{title}</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					const isActive = location.pathname.startsWith(item.url);
					item.isActive = isActive;
					return <SidebarItem key={item.title} {...item} />;
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default SidebarNav;
