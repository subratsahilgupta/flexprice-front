import { useParams } from 'react-router-dom';
import { integrations } from './integrationsData';
import { cn } from '@/lib/utils';
import { Button, FormHeader, Spacer } from '@/components/atoms';

const IntegrationDetails = () => {
	const { id: name } = useParams() as { id: string };
	const integration = integrations.find((integration) => integration.name.toLocaleLowerCase() === name.toLocaleLowerCase())!;

	return (
		<div className='page'>
			<div
				onClick={() => {}}
				className={cn('border rounded-xl p-4 flex items-center shadow-sm', !integration.comingSoon && 'cursor-pointer')}>
				<div className='size-20 flex items-center justify-center bg-gray-100 rounded-lg'>
					<img src={integration.logo} alt={integration.name} className='size-16 object-contain' />
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
				<div className='flex gap-2 items-center'>
					{/* <Button variant={'outline'} className='flex gap-2 items-center'>
                        View Dashboard
                    </Button> */}
					<Button onClick={() => {}} className='flex gap-2 items-center'>
						Install
					</Button>
				</div>
			</div>

			<Spacer height={32} />
			{/* details section */}
			<div className='card space-y-6'>
				{integration.info?.map((infoItem, idx) => (
					<div key={idx} className='mt-4'>
						<FormHeader variant='form-component-title' title={infoItem.title}></FormHeader>
						{infoItem.description.map((desc, descIdx) => (
							<p key={descIdx} className='text-gray-500 text-sm mt-1'>
								{desc}
							</p>
						))}
					</div>
				))}
			</div>
		</div>
	);
};

export default IntegrationDetails;
