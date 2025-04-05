import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/molecules/Sidebar';
import { BreadCrumbs } from '@/components/molecules';
import { DebugMenu } from '@/components/molecules';
import useUser from '@/hooks/useUser';
import posthog from 'posthog-js';
import { useEffect } from 'react';

const MainLayout: React.FC = () => {
	const { user } = useUser();

	useEffect(() => {
		if (user) {
			posthog.identify(user.email, {
				email: user.email,
				name: user.tenant?.name,
				created_at: user.tenant?.created_at ? new Date(user.tenant.created_at).getTime() : undefined,
			});
		} else {
			posthog.reset();
		}
	}, [user]);

	return (
		<SidebarProvider className='flex h-screen bg-gray-100 relative'>
			{/* Sidebar */}
			<Sidebar />
			{/* Right Layout */}
			<SidebarInset className='flex flex-col flex-1 bg-white h-screen relative'>
				<BreadCrumbs />
				{/* Main Content */}
				<main className='flex-1 px-4 relative overflow-y-auto '>
					<Outlet />
					<DebugMenu />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default MainLayout;
