//
// Dashboard-only data-fetching wrapper. NOT exported from the package — see `UsageQuota`.
import { useQuery } from '@tanstack/react-query';
import CustomerPortalApi from '@/api/CustomerPortalApi';
import { adaptUsageQuotaItems } from '../adapters';
import UsageQuota from '../components/UsageQuota';

interface UsageQuotaContainerProps {
	label?: string;
	className?: string;
}

const UsageQuotaContainer = ({ label, className }: UsageQuotaContainerProps) => {
	const { data } = useQuery({
		queryKey: ['portal-usage'],
		queryFn: () => CustomerPortalApi.getUsageSummary(),
	});

	const items = adaptUsageQuotaItems(data?.features ?? []);

	return <UsageQuota items={items} label={label} className={className} />;
};

export default UsageQuotaContainer;
