import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import React from 'react';
import SidebarNav, { NavItem } from './SidebarMenu';
import FlexpriceSidebarFooter from './SidebarFooter';
import { RouteNames } from '@/core/routes/Routes';
import { EnvironmentSelector } from '@/components/molecules';
import { Star, FileText, Gem, Users, Receipt, CalendarClock, Percent, TicketPercent, Plug2, CreditCard } from 'lucide-react';

const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
	const navMain: { [key: string]: NavItem[] } = {
		'Product Catalog': [
			{
				title: 'Features',
				url: RouteNames.features,
				icon: Star,
				// disabled: true,
			},

			{
				title: 'Plans',
				url: RouteNames.plan,
				icon: FileText,
			},

			{
				title: 'Pricing',
				url: RouteNames.pricing,
				icon: Gem,
			},
			// {
			// 	title: 'Add On',
			// 	url: RouteNames.addOn,
			// 	icon: Puzzle,
			// 	disabled: true,
			// },
			{
				title: 'Discounts',
				url: RouteNames.addOn,
				icon: TicketPercent,
				disabled: true,
			},
			{
				title: 'Taxes',
				url: RouteNames.addOn,
				icon: Percent,
				disabled: true,
			},
		],
		'Customer Management': [
			{
				title: 'Customers',
				url: RouteNames.customers,
				icon: Users,
			},
			{
				title: 'Invoices',
				url: RouteNames.invoices,
				icon: Receipt,
			},
			// {
			// 	title: 'Quotation',
			// 	url: '/roles',
			// 	icon: Receipt,
			// 	disabled: true,
			// },
		],
		'Usage Tracking': [
			// {
			// 	title: 'Meter',
			// 	url: RouteNames.meter,
			// 	icon: FileText,
			// },
			{
				title: 'Integrations',
				url: RouteNames.integrations,
				icon: Plug2,
			},
			// {
			// 	title: 'Query',
			// 	url: RouteNames.queryPage,
			// 	icon: FileSearch,
			// 	disabled: false,
			// },
			{
				title: 'Events',
				url: RouteNames.events,
				icon: CalendarClock,
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
			{
				title: 'Payments',
				url: RouteNames.queryPage,
				icon: CreditCard,
				disabled: true,
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
