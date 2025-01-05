import { useParams } from 'react-router-dom';
import CustomerCard from '@/components/molecules/Customer/CustomerCard';
import Tabbar from '@/components/molecules/Tabbar/Tabbar';
import Overview from './tabs/Overview';
import Wallet from './tabs/Wallet';
import Invoice from './tabs/Invoice';

const tabs = [
	{ id: 'overview', label: 'Overview', component: <Overview /> },
	{ id: 'wallet', label: 'Wallet', component: <Wallet /> },
	{ id: 'invoice', label: 'Invoice', component: <Invoice /> },
];

const CustomerDetails = () => {
	const { id: customerId } = useParams();
	return (
		<div className='p-6 space-y-6'>
			<CustomerCard customerId={customerId!} />
			<Tabbar tabs={tabs} initialActiveTab='overview' />
		</div>
	);
};

export default CustomerDetails;
