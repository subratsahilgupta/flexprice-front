import { Button, FormHeader, SectionHeader } from '@/components/atoms';
import { availableIntegrations, installedIntegrations, Integration } from './integrationsData';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Integrations = () => {
	return (
		<div className='page'>
			<SectionHeader title='Integrations' />
			<div className=''>
				<FormHeader title='Installed' variant='sub-header' />
				<div className='grid grid-cols-2 gap-4 '>
					{installedIntegrations.map((integration, index) => (
						<IntegrationCard key={index} integration={integration} />
					))}
				</div>
			</div>
			<div className='mt-6'>
				<FormHeader title='Available' variant='sub-header' />
				<div className='grid grid-cols-2 gap-4 '>
					{availableIntegrations.map((integration, index) => (
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
		<div className='relative'>
			<div
				onClick={() => {
					if (!integration.comingSoon) {
						navigate(integration.name.toLowerCase());
					}
				}}
				className={cn(
					'border rounded-xl p-4 flex items-center shadow-sm relative',
					integration.comingSoon ? 'cursor-not-allowed' : 'cursor-pointer',
				)}>
				{integration.comingSoon && <div className='absolute inset-0 bg-[#f9f9f9] opacity-50 rounded-xl' />}
				<div className='w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg'>
					<img src={integration.logo} alt={integration.name} className='w-12 h-12 object-contain' />
				</div>
				<div className='ml-4 flex-1'>
					<div className='flex items-center justify-between w-full mb-2'>
						<h3 className='font-semibold text-lg'>{integration.name}</h3>
						{integration.comingSoon && (
							<div className=' top-2 right-2 bg-[#FEF08A] text-[#D97706] text-xs !font-semibold px-2 py-1 rounded-2xl !opacity-55'>
								Coming Soon
							</div>
						)}
						{/* {integration.type === 'available' && !integration.comingSoon && (
							<Button variant={'outline'} onClick={() => { }} className=' flex w-6 h-8 gap-2 items-center'>
								<Plus className='w-4 h-4' />
							</Button>
						)} */}
					</div>
					<p className='text-gray-500 text-sm'>{integration.description}</p>
					<div className='mt-2 flex items-center gap-2'>
						{integration.tags.map((tag, idx) => (
							<span key={idx} className='text-xs bg-gray-200 px-2 py-1 rounded-md'>
								{tag}
							</span>
						))}
					</div>
					{integration.type === 'available' && !integration.comingSoon && (
						<Button onClick={() => {}} className='flex gap-2 items-center'>
							Install
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default Integrations;
