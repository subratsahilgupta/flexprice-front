import { Card } from '@/components/atoms';
import { AlertCircle } from 'lucide-react';
import { formatDateShort } from '@/utils/common/helper_functions';

interface SubscriptionPauseWarningProps {
	pauseStartDate: string;
	pauseEndDate: string;
	resumeDate: string;
}

const SubscriptionPauseWarning = ({ pauseStartDate, pauseEndDate, resumeDate }: SubscriptionPauseWarningProps) => {
	return (
		<Card variant='warning' className='mb-4'>
			<div className='flex items-start gap-3'>
				<AlertCircle className='size-5 flex-shrink-0 mt-0.5' />
				<div className='flex-1'>
					<h4 className='text-red-600 font-semibold mb-1'>The subscription is paused</h4>
					<p className='text-sm'>
						The subscription will be paused from {formatDateShort(pauseStartDate)} to {formatDateShort(pauseEndDate)}. The subscription will
						resume from {formatDateShort(resumeDate)} and the customer will not be charged until {formatDateShort(pauseEndDate)}.
					</p>
				</div>
			</div>
		</Card>
	);
};

export default SubscriptionPauseWarning;
