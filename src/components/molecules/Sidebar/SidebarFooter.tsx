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
					<span className={cn('text-sm select-none font-normal', sidebarOpen ? '' : 'hidden')}>{'Developers'}</span>
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
				<PopoverTrigger asChild>
					<button className='w-full flex items-center justify-between h-10 rounded-md gap-2 px-2 hover:bg-muted transition-colors'>
						<div className='flex items-center gap-1 min-w-0 flex-1'>
							<div className='size-5 text-xs   bg-primary text-primary-foreground flex justify-center items-center rounded-full flex-shrink-0 font-medium'>
								{user?.email ? user.email.charAt(0).toUpperCase() : 'F'}
							</div>
							<div className={cn('min-w-0 flex-1 text-left', sidebarOpen ? '' : 'hidden')}>
								{/* <p className='text-sm font-medium truncate'>{user?.email?.split('@')[0]}</p> */}
								<p className='text-xs text-muted-foreground truncate'>{user?.email}</p>
							</div>
						</div>
						<ChevronsUpDown className={cn('h-4 w-4 text-muted-foreground', sidebarOpen ? '' : 'hidden')} />
					</button>
				</PopoverTrigger>
				<PopoverContent className='w-64 p-2'>
					<button onClick={handleLogout} className='w-full flex items-center gap-2 rounded-md p-2 text-sm hover:bg-muted transition-colors'>
						<LogOut className='size-4' />
						<span>Logout</span>
					</button>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default SidebarFooter;
