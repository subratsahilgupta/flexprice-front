import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import React from 'react';
import SidebarNav, { NavItem } from './SidebarMenu';

const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
	const { open } = useSidebar();
	const navMain: { [key: string]: NavItem[] } = {
		'Usage Tracking': [
			{
				title: 'Billable Metrics',
				url: '/usage',
				icon: '/assets/svg/billable_metrics.svg',
			},
			{
				title: 'Query',
				url: '/customers',
				icon: '/assets/svg/query.svg',
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
			},
			{
				title: 'Pricing PLan',
				url: '/users',
				icon: '/assets/svg/pricing_plan.svg',
			},
			{
				title: 'Quotation',
				url: '/roles',
				icon: '/assets/svg/quotation.svg',
			},
			{
				title: 'Import - Export',
				url: '/roles',
				icon: '/assets/svg/import-export.svg',
			},
		],
	};

	return (
		<Sidebar collapsible='icon' {...props} className='font-open-sans border-none shadow-md max-w-[256px] bg-[#F8FAFC]'>
			<SidebarHeader>
				<div className='w-full mt-2 flex items-center justify-between'>
					<div className={`h-6 flex w-full rounded-md items-center gap-2 bg-contain ${!open ? 'hidden' : ''}`}>
						<img
							src={'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk'}
							className='size-8 bg-contain rounded-md'
							alt='company logo'
						/>
						<p className='font-semibold text-[14px]'>Acme Inc</p>
					</div>

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
