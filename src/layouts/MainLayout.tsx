import { Link, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/molecules/Sidebar';
import { BsChevronRight } from 'react-icons/bs';
import { useBreadcrumbStore } from '@/core/store/useBreadcrumbStore';
import { useEffect } from 'react';

const MainLayout: React.FC = () => {
	const { breadcrumbs, setBreadcrumbs } = useBreadcrumbStore();
	const location = useLocation();

	useEffect(() => {
		const pathSegments = location.pathname.split('/').filter(Boolean);

		// Construct new breadcrumbs while keeping the previous ones at the same index
		const newBreadcrumbs = pathSegments.map((segment, index, arr) => {
			const label = decodeURIComponent(segment).replace(/-/g, ' ');
			const path = `/${arr.slice(0, index + 1).join('/')}`;

			if (breadcrumbs[index]?.path === path) {
				return breadcrumbs[index];
			}

			return { label, path };
		});

		// Avoid unnecessary re-renders if breadcrumbs remain the same
		if (JSON.stringify(newBreadcrumbs) !== JSON.stringify(breadcrumbs)) {
			console.log('Updating breadcrumbs:', newBreadcrumbs);
			setBreadcrumbs(newBreadcrumbs);
		}
	}, [location.pathname, setBreadcrumbs]);

	return (
		<SidebarProvider className='flex h-screen bg-gray-100 relative'>
			{/* Sidebar */}
			<Sidebar />

			{/* Right Layout */}
			<SidebarInset className='flex flex-col flex-1 bg-white h-screen relative overflow-y-auto'>
				<header className='bg-white sticky top-0 z-10 shadow-sm'>
					<div className='px-6 py-4'>
						{/* Breadcrumbs */}
						<nav className='flex items-center space-x-2 text-sm text-gray-500'>
							{breadcrumbs.map((breadcrumb, index) => (
								<span key={index} className='flex items-center'>
									{index === breadcrumbs.length - 1 || index === 0 ? (
										<div
											className={`hover:text-gray-800 capitalize select-none ${
												index === breadcrumbs.length - 1 ? 'font-normal text-[#020617]' : ''
											}`}>
											{breadcrumb.label}
										</div>
									) : (
										<Link
											to={breadcrumb.path}
											className={`hover:text-gray-800 capitalize ${index === breadcrumbs.length - 1 ? 'font-normal text-[#020617]' : ''}`}>
											{breadcrumb.label}
										</Link>
									)}
									{index < breadcrumbs.length - 1 && (
										<span className='mx-2'>
											<BsChevronRight />
										</span>
									)}
								</span>
							))}
						</nav>
					</div>
				</header>

				{/* Main Content */}
				<main className='flex-1 px-4'>
					<Outlet />
				</main>
			</SidebarInset>

			{/* Toast Notifications */}
			<Toaster position='bottom-center' />
		</SidebarProvider>
	);
};

export default MainLayout;
