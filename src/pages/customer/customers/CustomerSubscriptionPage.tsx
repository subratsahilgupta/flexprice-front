import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';

const CustomerSubscriptionPage = () => {
	const { id: customerId } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		navigate(`/customer-management/customers/${customerId}`);
	}, [customerId, navigate]);

	return null;
};

export default CustomerSubscriptionPage;
