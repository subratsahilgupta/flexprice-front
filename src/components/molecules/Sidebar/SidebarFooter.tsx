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
					<span className='text-sm select-none'>{'Developers'}</span>
				</span>
			</SidebarMenuButton>
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

			{/* user profile */}
			<Popover>
				<PopoverTrigger>
					<div
						// onClick={() => setIsOpen(!isOpen)}
						className={`w-full !my-2 mt-2 flex items-center justify-between h-6 rounded-md gap-2 bg-contain`}>
						<div className='flex items-center text-start gap-2 flex-grow overflow-x-hidden'>
							<span className='size-8 bg-black text-white flex justify-center items-center bg-contain rounded-md'>
								{user?.email
									?.split(' ')
									.map((n) => n[0].toUpperCase())
									.join('')
									.slice(0, 2) || 'UN'}
							</span>
							<div className={cn('text-start', sidebarOpen ? '' : 'hidden')}>
								{/* <p className='font-semibold text-sm'>{user?.tenant?.name || 'Unknown'}</p> */}
								<p className='text-xs text-muted-foreground truncate'>{user?.email}</p>
							</div>
						</div>
						<button type='button' className={cn(sidebarOpen ? '' : 'hidden')}>
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
