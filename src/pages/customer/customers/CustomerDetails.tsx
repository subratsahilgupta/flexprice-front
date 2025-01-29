import { Outlet, useParams } from 'react-router-dom';
import Tabbar from '@/components/molecules/Tabbar/Tabbar';
import Overview from '../tabs/Overview';
import WalletTab from '../tabs/Wallet';
import Invoice from '../tabs/Invoice';
import CustomerHeader from '@/components/molecules/Customer/CustomerHeader';

const tabs = [
	{ id: 'overview', label: 'Overview', component: <Overview /> },
	{ id: 'wallet', label: 'Wallet', component: <WalletTab /> },
	{ id: 'invoice', label: 'Invoice', component: <Invoice /> },
];

const CustomerDetails = () => {
	const { id: customerId } = useParams();
	return (
		<div className='p-6 space-y-6'>
			<CustomerHeader customerId={customerId!} />
			<Tabbar tabs={tabs} initialActiveTab='overview' />
			<Outlet /> {/* This will render the active tab component */}
		</div>
	);
};

export default CustomerDetails;
