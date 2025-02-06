import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenuButton,
	SidebarTrigger,
	useSidebar,
} from '@/components/ui/sidebar';
import React from 'react';
import SidebarNav, { NavItem } from './SidebarMenu';
import { cn } from '@/lib/utils';
import { LogOut, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/core/supbase/config';
import useUser from '@/hooks/useUser';
import { Skeleton } from '@/components/ui/skeleton';

const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
	const { open } = useSidebar();
	const navigate = useNavigate();
	const handleLogout = async () => {
		await supabase.auth.signOut();
		localStorage.clear();
		navigate('/login');
	};

	const { loading, user } = useUser();

	const navMain: { [key: string]: NavItem[] } = {
		'Usage Tracking': [
			{
				title: 'Billable Metrics',
				url: '/usage-tracking/billable-metric',
				icon: '/assets/svg/billable_metrics.svg',
			},
			{
				title: 'Query',
				url: '/usage-tracking/query',
				icon: '/assets/svg/query.svg',
				disabled: false,
			},
			{
				title: 'Events',
				url: '/usage-tracking/events',
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
				url: '/customer-management/customers',
				icon: '/assets/svg/customers.svg',
			},

			{
				title: 'Invoices',
				url: '/customer-management/invoices',
				icon: '/assets/svg/receipt.svg',
			},
			{
				title: 'Quotation',
				url: '/roles',
				icon: '/assets/svg/quotation.svg',
				disabled: true,
			},
			{
				title: 'Import - Export',
				url: '/roles',
				icon: '/assets/svg/import-export.svg',
				disabled: true,
			},
		],
		'Product Cataglog': [
			{
				title: 'Pricing Plan',
				url: '/product-catalog/pricing-plan',
				icon: '/assets/svg/pricing_plan.svg',
			},
			{
				title: 'Features',
				url: '/product-catalog/features',
				icon: <Star />,
				disabled: true,
			},
		],
	};

	return (
		<Sidebar collapsible='icon' {...props} className='font-open-sans border-none shadow-md max-w-[256px] bg-[#F8FAFC]'>
			<SidebarHeader>
				<div className='w-full mt-2 flex items-center justify-between'>
					{loading ? (
						<Skeleton className={`h-6 w-full`}></Skeleton>
					) : (
						<div className={`h-6 flex w-full rounded-md items-center gap-2 bg-contain ${!open ? 'hidden' : ''}`}>
							<span className='size-7 bg-black text-white flex justify-center items-center bg-contain rounded-md'>
								{user?.tenant.name
									?.split(' ')
									.map((n) => n[0])
									.join('')
									.slice(0, 2)}
							</span>
							<p className='font-semibold text-[14px]'>{user?.tenant.name}</p>
						</div>
					)}
					<SidebarTrigger />
				</div>
			</SidebarHeader>
			<SidebarContent className='gap-0'>
				{Object.entries(navMain).map(([key, value]) => (
					<SidebarNav key={key} items={value} title={key} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenuButton
					onClick={() => {
						handleLogout();
					}}
					tooltip={'Logout'}
					className={cn(`flex items-center gap-2 hover:bg-muted transition-colors `)}>
					{<LogOut />}
					<span className='text-sm select-none'>{'Logout'}</span>
				</SidebarMenuButton>
			</SidebarFooter>
			{/* <SidebarRail /> */}
		</Sidebar>
	);
};

export default AppSidebar;
