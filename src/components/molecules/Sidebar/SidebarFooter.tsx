import { ChevronsUpDown, LogOut } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { RouteNames } from '@/core/routes/Routes';
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { CodeXml } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '@/core/supbase/config';
import useUser from '@/hooks/useUser';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
const SidebarFooter = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const handleLogout = async () => {
		await supabase.auth.signOut();
		localStorage.clear();
		navigate('/auth');
	};

	const { loading, user } = useUser();
	const { open: sidebarOpen } = useSidebar();

	if (loading) return <Skeleton className='w-full h-10' />;

	return (
		<div className='flex flex-col gap-2 w-full'>
			<SidebarMenuButton
				isActive={true}
				onClick={() => {
					navigate(RouteNames.developers);
				}}
				tooltip={'Developers'}
				className={cn(
					`flex items-center justify-between gap-2 hover:bg-muted transition-colors `,
					location.pathname.startsWith(RouteNames.developers) ? 'bg-[#F4F4F5] font-medium text-sidebar-text-accent-foreground' : '',
				)}>
				<span className={cn('flex items-center gap-2')}>
					<CodeXml className='size-4' />
					<span className='text-sm select-none font-normal'>{'Developers'}</span>
				</span>
			</SidebarMenuButton>
			<SidebarMenuButton
				onClick={() => {
					window.open('https://docs.flexprice.io', '_blank');
				}}
				tooltip={'Documentation'}
				className={cn(`flex items-center justify-between gap-2 hover:bg-muted transition-colors my-0 py-1 `)}>
				<span className='flex items-center gap-2'>
					<BookOpen className='size-4' />
					<span className='text-sm select-none'>{'Documentation'}</span>
				</span>
				<ExternalLink />
			</SidebarMenuButton>

			{/* user profile */}
			<Popover>
				<PopoverTrigger>
					<div className='w-full flex items-center justify-between h-10 rounded-md gap-2 px-2'>
						<div className='flex items-center gap-2 min-w-0 flex-1'>
							<span className='min-w-7 h-7 bg-black text-white flex justify-center items-center rounded-md flex-shrink-0'>
								{user?.email
									?.split(' ')
									.map((n) => n[0].toUpperCase())
									.join('')
									.slice(0, 2) || 'UN'}
							</span>
							<div className={cn('min-w-0 flex-1', sidebarOpen ? '' : 'hidden')}>
								<p className='text-xs text-muted-foreground truncate'>{user?.email}</p>
							</div>
						</div>
						<button type='button' className={cn('flex-shrink-0', sidebarOpen ? '' : 'hidden')}>
							<ChevronsUpDown className='h-4 w-4 opacity-50' />
						</button>
					</div>
				</PopoverTrigger>
				<PopoverContent className='max-w-[256px] p-2'>
					<button
						onClick={() => {
							handleLogout();
						}}
						className={cn(`p-2 w-full text-sm flex items-center gap-2 hover:bg-muted transition-colors `)}>
						<LogOut className='size-4' />
						<span className='text-sm select-none'>{'Logout'}</span>
					</button>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default SidebarFooter;
