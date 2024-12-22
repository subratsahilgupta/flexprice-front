import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import React from 'react';
import { LuUsers } from 'react-icons/lu';
import { RiSpeedUpLine } from 'react-icons/ri';
import { GrCatalogOption } from 'react-icons/gr';
import SidebarNav from './SidebarMenu';

const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
	const { open } = useSidebar();
	const navMain = [
		{
			title: 'Pricing Page',
			url: '/price',
			icon: GrCatalogOption,
			isActive: false,
			items: [],
		},
		{
			title: 'Customers',
			url: '/customers',
			icon: LuUsers,
			isActive: false,
			items: [],
		},
		{
			title: 'Metering',
			url: '/metering',
			icon: RiSpeedUpLine,
			isActive: false,
			items: [
				{
					title: 'Billable Metrics',
					url: '/metering/a',
				},
				{
					title: 'Query',
					url: '/metering/b',
				},
				{
					title: 'Events',
					url: '/metering/c',
				},
			],
		},
	];

	return (
		<Sidebar collapsible='icon' {...props} className='border-none shadow-md'>
			<SidebarHeader>
				<div className='w-full mt-2 flex items-center justify-between'>
					<img src='/assets/logo/logo.png' alt='FlexPrice Logo' className={`h-6 ml-5 bg-contain ${!open ? 'hidden' : ''}`} />
					{/* <button
						className='text-xl p-2'
						onClick={() => {
							toggleSidebar();
						}}>
						{!open ? <FaAngleRight className='text-gray-400' /> : <FaAngleLeft className='text-gray-400' />}
					</button> */}
					<SidebarTrigger />
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarNav items={navMain} />
			</SidebarContent>
			<SidebarFooter></SidebarFooter>
			{/* <SidebarRail /> */}
		</Sidebar>
	);
};

export default AppSidebar;
