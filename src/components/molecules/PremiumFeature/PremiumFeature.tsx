import { Button, Dialog } from '@/components/atoms';
import { Lock } from 'lucide-react';
import { useState } from 'react';

export const PremiumFeatureTag = () => {
	return (
		<div className='flex gap-2 top-2 right-2 items-center justify-center bg-[#FEF08A] text-[#D97706] text-xs !font-semibold px-2 py-1 rounded-2xl !opacity-55'>
			Premium Feature
			<Lock className='size-3 text-xs !font-bold' />
		</div>
	);
};

interface Props {
	children?: React.ReactNode;
	isPremiumFeature?: boolean;
}
const PremiumFeature: React.FC<Props> = ({ children, isPremiumFeature = false }) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<div>
			<Dialog
				isOpen={isOpen}
				onOpenChange={setIsOpen}
				title='Premium Feature'
				titleClassName='font-bold'
				description='This is a premium feature. You need to upgrade to a premium plan to use this feature.'>
				<div className='flex gap-2 justify-end items-center'>
					<Button
						onClick={() => {
							window.open('mailto:manish@flexprice.com', '_blank');
						}}>
						Contact Us
					</Button>
				</div>
			</Dialog>
			<div
				onClick={() => {
					if (isPremiumFeature) {
						setIsOpen(true);
					}
				}}>
				{children}
			</div>
		</div>
	);
};

export default PremiumFeature;
