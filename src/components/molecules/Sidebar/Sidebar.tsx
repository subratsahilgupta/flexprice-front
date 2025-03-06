import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import React from 'react';
import SidebarNav, { NavItem } from './SidebarMenu';
import { Plug2, Star, FileSearch, CalendarClock, Gem } from 'lucide-react';
import FlexpriceSidebarFooter from './SidebarFooter';

import { RouteNames } from '@/core/routes/Routes';
import { EnvironmentSelector } from '@/components/molecules';
const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
	const navMain: { [key: string]: NavItem[] } = {
		'Product Cataglog': [
			{
				title: 'Features',
				url: RouteNames.features,
				icon: <Star />,
				// disabled: true,
			},
			{
				title: 'Plans',
				url: RouteNames.plan,
				icon: '/assets/svg/pricing_plan.svg',
			},
			{
				title: 'Pricing Page',
				url: RouteNames.pricing,
				icon: <Gem />,
			},
			// {
			// 	title: 'Add On',
			// 	url: RouteNames.addOn,
			// 	icon: <Puzzle />,
			// 	disabled: true,
			// },
		],
		'Customer Management': [
			{
				title: 'Customers',
				url: RouteNames.customers,
				icon: '/assets/svg/customers.svg',
			},

			{
				title: 'Invoices',
				url: RouteNames.invoices,
				icon: '/assets/svg/receipt.svg',
			},

			// {
			// 	title: 'Quotation',
			// 	url: '/roles',
			// 	icon: '/assets/svg/quotation.svg',
			// 	disabled: true,
			// },
		],
		'Usage Tracking': [
			// {
			// 	title: 'Meter',
			// 	url: RouteNames.meter,
			// 	icon: '/assets/svg/billable_metrics.svg',
			// },
			{
				title: 'Query',
				url: RouteNames.queryPage,
				icon: <FileSearch />,
				disabled: false,
			},
			{
				title: 'Events',
				url: RouteNames.events,
				icon: <CalendarClock />,
				isActive: false,
				// items: [
				// 	{
				// 		title: 'Features',
				// 		url: '/metering/a',
				// 	},
				// 	{
				// 		title: 'Query',
				// 		url: '/metering/b',
				// 	},
				// 	{
				// 		title: 'Events',
				// 		url: '/metering/c',
				// 	},
				// ],
			},
		],

		'Insights & Tools': [
			{
				title: 'Integrations',
				url: RouteNames.integrations,
				icon: <Plug2 />,
			},
			{
				title: 'Bulk Imports',
				url: RouteNames.importExport,
				icon: '/assets/svg/import-export.svg',
				// disabled: true,
			},
		],
	};

	return (
		<Sidebar collapsible='icon' {...props} className='font-open-sans border-none shadow-md max-w-[256px] bg-[#F8FAFC]'>
			<SidebarHeader>
				<EnvironmentSelector />
			</SidebarHeader>
			<SidebarContent className='gap-0'>
				{Object.entries(navMain).map(([key, value]) => (
					<SidebarNav key={key} items={value} title={key} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<FlexpriceSidebarFooter />
			</SidebarFooter>
			{/* <SidebarRail /> */}
		</Sidebar>
	);
};

export default AppSidebar;
