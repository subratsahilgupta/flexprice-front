import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/molecules/Sidebar';
import { BreadCrumbs } from '@/components/molecules';

const MainLayout: React.FC = () => {
	// Initialize breadcrumbs

	return (
		<SidebarProvider className='flex h-screen bg-gray-100 relative'>
			{/* Sidebar */}
			<Sidebar />
			{/* Right Layout */}
			<SidebarInset className='flex flex-col flex-1 bg-white h-screen relative overflow-y-auto'>
				<BreadCrumbs />
				{/* Main Content */}
				<main className='flex-1 px-4'>
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default MainLayout;
