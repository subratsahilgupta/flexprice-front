import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton } from '@/components/ui/sidebar';
import React from 'react';
import SidebarNav, { NavItem } from './SidebarMenu';
import { cn } from '@/lib/utils';
import { LogOut, Plug2, Star, BookOpen, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/core/supbase/config';

import { RouteNames } from '@/core/routes/Routes';
import { EnvironmentSelector } from '@/components/molecules';
const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
	const navigate = useNavigate();
	const handleLogout = async () => {
		await supabase.auth.signOut();
		localStorage.clear();
		navigate('/auth');
	};

	const navMain: { [key: string]: NavItem[] } = {
		'Usage Tracking': [
			{
				title: 'Meter',
				url: RouteNames.meter,
				icon: '/assets/svg/billable_metrics.svg',
			},
			{
				title: 'Query',
				url: RouteNames.queryPage,
				icon: '/assets/svg/query.svg',
				disabled: false,
			},
			{
				title: 'Events',
				url: RouteNames.events,
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
		'Product Cataglog': [
			{
				title: 'Pricing Plan',
				url: RouteNames.pricingPlan,
				icon: '/assets/svg/pricing_plan.svg',
			},
			{
				title: 'Features',
				url: RouteNames.features,
				icon: <Star />,
				// disabled: true,
			},
			// {
			// 	title: 'Add On',
			// 	url: RouteNames.addOn,
			// 	icon: <Puzzle />,
			// 	disabled: true,
			// },
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
				<SidebarMenuButton
					onClick={() => {
						window.open('https://docs.flexprice.io', '_blank');
					}}
					tooltip={'Documentation'}
					className={cn(`flex items-center justify-between gap-2 hover:bg-muted transition-colors `)}>
					<span className='flex items-center gap-2'>
						<BookOpen className='size-4' />
						<span className='text-sm select-none'>{'Documentation'}</span>
					</span>
					<ExternalLink />
				</SidebarMenuButton>
				<SidebarMenuButton
					onClick={() => {
						handleLogout();
					}}
					tooltip={'Logout'}
					className={cn(`flex items-center gap-2 hover:bg-muted transition-colors `)}>
					<LogOut />
					<span className='text-sm select-none'>{'Logout'}</span>
				</SidebarMenuButton>
			</SidebarFooter>
			{/* <SidebarRail /> */}
		</Sidebar>
	);
};

export default AppSidebar;
