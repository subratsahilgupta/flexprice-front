import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import React from 'react';
import SidebarNav, { NavItem } from './SidebarMenu';

const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
	const { open } = useSidebar();
	const navMain: { [key: string]: NavItem[] } = {
		'Usage Tracking': [
			{
				title: 'Billable Metrics',
				url: '/price',
				icon: '/assets/svg/billable_metrics.svg',
				isActive: true,
				items: [],
			},
			{
				title: 'Query',
				url: '/customers',
				icon: '/assets/svg/query.svg',
				isActive: false,
				items: [],
			},
			{
				title: 'Events',
				url: '/metering',
				icon: '/assets/svg/events.svg',
				isActive: false,
				// items: [
				// 	{
				// 		title: 'Billable Metrics',
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
		'Customer Management': [
			{
				title: 'Customers',
				url: '/customers',
				icon: '/assets/svg/customers.svg',
				isActive: false,
				items: [],
			},
			{
				title: 'Pricing PLan',
				url: '/users',
				icon: '/assets/svg/pricing_plan.svg',
				isActive: false,
				items: [],
			},
			{
				title: 'Quotation',
				url: '/roles',
				icon: '/assets/svg/quotation.svg',
				isActive: false,
				items: [],
			},
			{
				title: 'Import - Export',
				url: '/roles',
				icon: '/assets/svg/import-export.svg',
				isActive: false,
				items: [],
			},
		],
	};

	return (
		<Sidebar collapsible='icon' {...props} className='font-open-sans border-none shadow-md max-w-[256px] bg-[#F8FAFC]'>
			<SidebarHeader>
				<div className='w-full mt-2 flex items-center justify-between'>
					<img src='/assets/logo/logo.png' alt='FlexPrice Logo' className={`h-6 ml-5 bg-contain ${!open ? 'hidden' : '/assets/svg/'}`} />

					<SidebarTrigger />
				</div>
			</SidebarHeader>
			<SidebarContent className='gap-0'>
				{Object.entries(navMain).map(([key, value]) => (
					<SidebarNav key={key} items={value} title={key} />
				))}
			</SidebarContent>
			<SidebarFooter></SidebarFooter>
			{/* <SidebarRail /> */}
		</Sidebar>
	);
};

export default AppSidebar;
