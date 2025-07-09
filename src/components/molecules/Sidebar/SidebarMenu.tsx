'use client';

import { FC, useState } from 'react';
import React from 'react';
import { SidebarGroup, SidebarMenu } from '@/components/ui/sidebar';
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
	isOpen?: boolean;
	onToggle?: () => void;
};

const SidebarNav: FC<{ items: NavItem[] }> = ({ items }) => {
	const location = useLocation();
	const [openItem, setOpenItem] = useState<string | null>(null);

	// Initialize openItem based on active item on mount
	React.useEffect(() => {
		const activeItem = items.find((item) => {
			const isMainItemActive = location.pathname.startsWith(item.url) && item.url !== '#';
			const isSubItemActive = item.items?.some((subItem) => location.pathname.startsWith(subItem.url));
			return isMainItemActive || isSubItemActive;
		});

		if (activeItem && activeItem.items && activeItem.items.length > 0) {
			setOpenItem(activeItem.title);
		}
	}, [location.pathname, items]);

	const handleItemToggle = (itemTitle: string) => {
		setOpenItem(openItem === itemTitle ? null : itemTitle);
	};

	return (
		<SidebarGroup className='mb-0'>
			<SidebarMenu className='gap-3'>
				{items.map((item) => {
					// Check if current path matches the main item URL or any of its sub-items
					const isMainItemActive = location.pathname.startsWith(item.url) && item.url !== '#';
					const isSubItemActive = item.items?.some((subItem) => location.pathname.startsWith(subItem.url));
					const isActive = isMainItemActive || isSubItemActive;
					item.isActive = isActive;

					return <SidebarItem key={item.title} {...item} isOpen={openItem === item.title} onToggle={() => handleItemToggle(item.title)} />;
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default SidebarNav;
