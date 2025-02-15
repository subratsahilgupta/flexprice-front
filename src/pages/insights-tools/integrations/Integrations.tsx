import { FormHeader, SectionHeader } from '@/components/atoms';
import { comingSoonIntegration, Integration, integrations } from './integrationsData';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Integrations = () => {
	return (
		<div className='page'>
			<SectionHeader title='Integrations' />
			<div className=''>
				<FormHeader title='Installed Integrations' variant='sub-header' />
				<div className='grid grid-cols-2 gap-4 '>
					{integrations.map((integration, index) => (
						<IntegrationCard key={index} integration={integration} />
					))}
				</div>
			</div>
			<div className='mt-6'>
				<FormHeader title='Available Integrations' variant='sub-header' />
				<div className='grid grid-cols-2 gap-4 '>
					{comingSoonIntegration.map((integration, index) => (
						<IntegrationCard key={index} integration={integration} />
					))}
				</div>
			</div>
		</div>
	);
};

const IntegrationCard = ({ integration }: { integration: Integration }) => {
	const navigate = useNavigate();
	return (
		<div
			onClick={() => {
				if (integration.comingSoon) {
					return;
				}
				navigate(integration.name.toLowerCase());
			}}
			className={cn('border rounded-xl p-4 flex items-center shadow-sm', !integration.comingSoon && 'cursor-pointer')}>
			<div className='w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg'>
				<img src={integration.logo} alt={integration.name} className='w-12 h-12 object-contain' />
			</div>
			<div className='ml-4 flex-1'>
				<div className='flex items-center justify-between w-full'>
					<h3 className='font-semibold text-lg'>{integration.name}</h3>
					{integration.comingSoon && <span className='text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-2xl'>Coming Soon</span>}
				</div>
				<p className='text-gray-500 text-sm'>{integration.description}</p>
				<div className='mt-2 flex items-center gap-2'>
					{integration.tags.map((tag, idx) => (
						<span key={idx} className='text-xs bg-gray-200 px-2 py-1 rounded-md'>
							{tag}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};

export default Integrations;
