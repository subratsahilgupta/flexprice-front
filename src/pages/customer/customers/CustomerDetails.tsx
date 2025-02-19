import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import CustomerHeader from '@/components/molecules/Customer/CustomerHeader';
import { useEffect, useState } from 'react';
import { useBreadcrumbsStore } from '@/store/useBreadcrumbsStore';
import { useQuery } from '@tanstack/react-query';
import CustomerApi from '@/utils/api_requests/CustomerApi';

const tabs = [
	{ id: '', label: 'Overview' },
	{ id: 'wallet', label: 'Wallet' },
	{ id: 'invoice', label: 'Invoice' },
	// { id: 'credit-note', label: 'Credit Note' },
] as const;

type TabId = (typeof tabs)[number]['id'];

const getActiveTab = (pathTabId: string): TabId => {
	const validTabId = tabs.find((tab) => tab.id === pathTabId);
	return validTabId ? validTabId.id : '';
};

const CustomerDetails = () => {
	const { id: customerId } = useParams();
	const location = useLocation();
	const [activeTab, setActiveTab] = useState<TabId>(tabs[0]?.id);
	const navigate = useNavigate();

	const { data: customer } = useQuery({
		queryKey: ['fetchCustomerDetails', customerId],
		queryFn: async () => await CustomerApi.getCustomerById(customerId!),
	});

	const { updateBreadcrumb, setSegmentLoading } = useBreadcrumbsStore();

	// Handle tab changes based on URL
	useEffect(() => {
		const currentPath = location.pathname.split('/');
		const pathTabId = currentPath[4] || '';
		const newActiveTab = getActiveTab(pathTabId);
		setActiveTab(newActiveTab);
	}, [location.pathname]);

	// Update breadcrumbs based on active tab
	useEffect(() => {
		// Set loading state for tab segment if we're going to show it
		if (activeTab !== '') {
			setSegmentLoading(3, true);
		}

		// Find the tab label for the active tab
		const activeTabData = tabs.find((tab) => tab.id === activeTab);
		setSegmentLoading(2, true);

		if (activeTab !== '' && activeTabData) {
			// Update breadcrumb with tab name for non-overview tabs
			updateBreadcrumb(3, activeTabData.label);
		}
		if (customer?.external_id) {
			updateBreadcrumb(2, customer.external_id);
		}
	}, [activeTab, updateBreadcrumb, setSegmentLoading, customer, location.pathname]);

	console.log('activeTab', activeTab);

	const onTabChange = (tabId: TabId) => {
		navigate(`/customer-management/customers/${customerId}/${tabId}`);
	};

	return (
		<div className='p-6 space-y-6'>
			<CustomerHeader customerId={customerId!} />
			<div className='border-b border-border'>
				<nav className='flex space-x-4' aria-label='Tabs'>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => onTabChange(tab.id)}
							className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none
								${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:border-muted'}`}
							role='tab'
							aria-selected={activeTab === tab.id}>
							{tab.label}
							{activeTab === tab.id && <span className='absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded' aria-hidden='true' />}
						</button>
					))}
				</nav>
			</div>
			<Outlet />
		</div>
	);
};

export default CustomerDetails;
