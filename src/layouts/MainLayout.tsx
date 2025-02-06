import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/molecules/Sidebar';
import { BreadCrumbs } from '@/components/molecules';

const MainLayout: React.FC = () => {
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

			{/* Toast Notifications */}
			<Toaster
				toastOptions={{
					success: {
						iconTheme: {
							primary: '#5CA7A0',
							secondary: '#fff',
						},
					},
					error: {
						iconTheme: {
							primary: '#E76E50',
							secondary: '#fff',
						},
					},
				}}
				position='bottom-center'
			/>
		</SidebarProvider>
	);
};

export default MainLayout;
