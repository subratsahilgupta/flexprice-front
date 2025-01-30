import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import CustomerHeader from '@/components/molecules/Customer/CustomerHeader';
import { useEffect, useState } from 'react';

const tabs = [
	{ id: '', label: 'Overview' },
	{ id: 'wallet', label: 'Wallet' },
	{ id: 'invoice', label: 'Invoice' },
];

const getActiveTab = (tabId: string) => {
	switch (tabId) {
		case 'wallet':
			return tabId;
		case 'invoice':
			return tabId;
		case '':
			return tabId;
		case 'subscription':
			return '';
		default:
			return '';
	}
};

const CustomerDetails = () => {
	const { id: customerId } = useParams();
	const location = useLocation();
	const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id);
	const navigate = useNavigate();

	useEffect(() => {
		const currentPath = location.pathname.split('/');

		const tabId = currentPath[4];
		setActiveTab(getActiveTab(tabId));
	}, [location.pathname]);

	const onTabChange = (tabId: string) => {
		setActiveTab(tabId);
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
