import { FormHeader, SectionHeader } from '@/components/atoms';

type Integration = {
	name: string;
	description: string;
	logo: string;
	tags: string[];
	comingSoon?: boolean;
};

const integrations: Integration[] = [
	{
		name: 'Stripe',
		description: 'Send invoices, calculate tax and collect payment.',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
		tags: ['Payment', 'Calculate Tax', 'Invoice Customer'],
		comingSoon: true,
	},
	{
		name: 'Razorpay',
		description:
			'Razorpay is a payments solution in India that allows businesses to accept, process and disburse payments with its product suite.',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Razorpay_logo.png',
		tags: [],
	},
];

const Integrations = () => {
	return (
		<div className='page'>
			<SectionHeader title='Integrations' />
			<div className=''>
				<FormHeader title='Available Integrations' variant='sub-header' />
				<div className='grid grid-cols-2 gap-4 '>
					{integrations.map((integration, index) => (
						<IntegrationCard key={index} integration={integration} />
					))}
				</div>
			</div>
			<div className='mt-6'>
				<FormHeader title='Available Integrations' variant='sub-header' />
				<div className='grid grid-cols-2 gap-4 '>
					{integrations.map((integration, index) => (
						<IntegrationCard key={index} integration={integration} />
					))}
				</div>
			</div>
		</div>
	);
};

const IntegrationCard = ({ integration }: { integration: Integration }) => {
	return (
		<div className='border rounded-xl p-4 flex items-center shadow-sm'>
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
