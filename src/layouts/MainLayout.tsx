import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/molecules/Sidebar';

const MainLayout: React.FC = () => {
	const location = useLocation();

	const pathSegments = location.pathname.split('/').filter((segment) => segment);

	return (
		<SidebarProvider className='flex h-screen bg-gray-100'>
			{/* sidebar */}
			<Sidebar />

			{/* right layout  */}
			<SidebarInset className='flex flex-col flex-1'>
				<header className='bg-white shadow-sm'>
					<div className='px-6 py-4'>
						{/* breadcrumbs */}
						<nav className='flex items-center space-x-2 text-sm text-gray-500'>
							{pathSegments.map((segment, index) => {
								const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
								const name = decodeURIComponent(segment);

								return (
									<span key={index} className='flex items-center'>
										<a href={path} className='hover:text-gray-800 capitalize'>
											{name}
										</a>
										{index < pathSegments.length - 1 && <span className='mx-2'>/</span>}
									</span>
								);
							})}
						</nav>
					</div>
				</header>

				{/* main layout */}
				<main className='flex-1 p-6'>
					<Outlet />
				</main>
			</SidebarInset>
			<Toaster />
		</SidebarProvider>
	);
};

export default MainLayout;
