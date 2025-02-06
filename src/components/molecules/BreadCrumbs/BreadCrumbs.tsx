import { useBreadcrumbStore } from '@/core/store/useBreadcrumbStore';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BsChevronRight } from 'react-icons/bs';

const BreadCrumbs = () => {
	const { breadcrumbs, setBreadcrumbs, breadcrumbCache } = useBreadcrumbStore();
	const location = useLocation();

	useEffect(() => {
		const path = location.pathname;
		const pathSegments = path.split('/').filter(Boolean);
		console.log('Path segments:', pathSegments);

		if (breadcrumbCache[path]) {
			console.log('Using cached breadcrumbs for', path);
			setBreadcrumbs(breadcrumbCache[path], true);
			return;
		} else {
			// Construct new breadcrumbs
			const newBreadcrumbs = pathSegments.map((segment, index, arr) => {
				const label = decodeURIComponent(segment).replace(/-/g, ' ');
				const path = `/${arr.slice(0, index + 1).join('/')}`;

				if (breadcrumbs[index]?.path === path) {
					console.log('Using cached breadcrumb for', path);
					return breadcrumbs[index];
				} else {
					return { label, path };
				}
			});
			console.log('New breadcrumbs:', newBreadcrumbs);

			// Only update breadcrumbs if they're different from the current ones
			if (!areBreadcrumbsEqual(newBreadcrumbs, breadcrumbs)) {
				setBreadcrumbs(newBreadcrumbs);
				console.log('Updating breadcrumbs:', newBreadcrumbs);
			}
		}
	}, [location.pathname, breadcrumbs, setBreadcrumbs]);

	const areBreadcrumbsEqual = (newBreadcrumbs: string | any[], currentBreadcrumbs: string | any[]) => {
		if (newBreadcrumbs.length !== currentBreadcrumbs.length) return false;
		for (let i = 0; i < newBreadcrumbs.length; i++) {
			if (newBreadcrumbs[i].path !== currentBreadcrumbs[i].path) {
				return false;
			}
		}
		return true;
	};

	return (
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
	);
};

export default BreadCrumbs;
