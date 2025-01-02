import { Link, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/molecules/Sidebar';
import { BsChevronRight } from 'react-icons/bs';

const MainLayout: React.FC = () => {
	const location = useLocation();

	const pathSegments = location.pathname.split('/').filter((segment) => segment);

	return (
		<SidebarProvider className='flex h-screen bg-gray-100 relative'>
			{/* sidebar */}
			<Sidebar />

			{/* right layout  */}
			<SidebarInset className='flex flex-col flex-1 bg-white h-screen relative overflow-y-auto'>
				<header className='bg-white sticky top-0 z-10 shadow-sm'>
					<div className='px-6 py-4'>
						{/* breadcrumbs */}
						<nav className='flex items-center space-x-2 text-sm text-gray-500'>
							{pathSegments.map((segment, index) => {
								const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
								const name = decodeURIComponent(segment);
								const isCurrentPath = index === pathSegments.length - 1;
								const isFirstPath = index === 0;

								return (
									<span key={index} className='flex items-center'>
										{isFirstPath ? (
											<span className={` cursor-default capitalize ${isCurrentPath ? 'font-normal text-[#020617]' : ''}`}>
												{name.replace(/-/g, ' ')}
											</span>
										) : (
											<Link to={path} className={`hover:text-gray-800 capitalize ${isCurrentPath ? 'font-normal text-[#020617]' : ''}`}>
												{name.replace(/-/g, ' ')}
											</Link>
										)}
										{index < pathSegments.length - 1 && (
											<span className='mx-2'>
												<BsChevronRight />
											</span>
										)}
									</span>
								);
							})}
						</nav>
					</div>
				</header>

				{/* main layout */}
				<main className='flex-1 px-4 '>
					<Outlet />
				</main>
			</SidebarInset>
			<Toaster />
		</SidebarProvider>
	);
};

export default MainLayout;
