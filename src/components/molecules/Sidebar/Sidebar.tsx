import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import React from 'react';
import SidebarNav, { NavItem } from './SidebarMenu';
import FlexpriceSidebarFooter from './SidebarFooter';
import { RouteNames } from '@/core/routes/Routes';
import { EnvironmentSelector } from '@/components/molecules';
import { Users, TrendingUp, Settings, Boxes } from 'lucide-react';

const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
	const navMain: NavItem[] = [
		{
			title: 'Product Catalog',
			url: '#',
			icon: Boxes,
			items: [
				{
					title: 'Features',
					url: RouteNames.features,
				},
				{
					title: 'Plans',
					url: RouteNames.plan,
				},
				{
					title: 'Pricing Widget',
					url: RouteNames.pricing,
				},
			],
		},
		{
			title: 'Customer',
			url: '#',
			icon: Users,
			items: [
				{
					title: 'Customers',
					url: RouteNames.customers,
				},
				{
					title: 'Invoices',
					url: RouteNames.invoices,
				},
				{
					title: 'Credit Notes',
					url: RouteNames.creditNotes,
				},
				{
					title: 'Payments',
					url: RouteNames.payments,
				},
			],
		},
		{
			title: 'Usage Tracking',
			url: '#',
			icon: TrendingUp,
			items: [
				{
					title: 'Events Debugger',
					url: RouteNames.events,
				},
				{
					title: 'Query',
					url: RouteNames.queryPage,
				},
			],
		},
		{
			title: 'Tools',
			url: '#',
			icon: Settings,
			items: [
				{
					title: 'Integrations',
					url: RouteNames.integrations,
				},
				{
					title: 'Bulk Imports',
					url: RouteNames.bulkImports,
				},
			],
		},
	];

	return (
		<Sidebar collapsible='icon' {...props} className='border-none px-3 py-1 shadow-md  bg-[#f9f9f9]'>
			<SidebarHeader>
				<EnvironmentSelector />
			</SidebarHeader>
			<SidebarContent className='gap-0 mt-4'>
				<SidebarNav items={navMain} />
			</SidebarContent>
			<SidebarFooter>
				<FlexpriceSidebarFooter />
			</SidebarFooter>
		</Sidebar>
	);
};

export default AppSidebar;
