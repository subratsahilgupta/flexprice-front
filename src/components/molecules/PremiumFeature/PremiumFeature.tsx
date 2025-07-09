import { Button, Dialog } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

export const PremiumFeatureTag = () => {
	return (
		<div className='flex gap-2 top-2 right-2 items-center justify-center  text-[#ffbf76] text-xs !font-semibold px-2 py-1 rounded-2xl !opacity-80'>
			<Sparkles fill='#ffbf76' className='size-4 text-xs !font-bold' />
		</div>
	);
};

interface Props {
	children?: React.ReactNode;
	isPremiumFeature?: boolean;
	showPremiumFeatureTag?: boolean;
}
const PremiumFeature: React.FC<Props> = ({ children, isPremiumFeature = false, showPremiumFeatureTag = true }) => {
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
					<Button>
						<a href='mailto:manish@flexprice.com'>Contact Us</a>
					</Button>
				</div>
			</Dialog>
			{isPremiumFeature && showPremiumFeatureTag ? (
				<div
					onClick={(e) => {
						if (isPremiumFeature) {
							e.preventDefault();
							e.stopPropagation();
							setIsOpen(true);
						}
					}}
					style={{
						pointerEvents: isPremiumFeature ? 'auto' : 'none',
						cursor: isPremiumFeature ? 'pointer' : 'not-allowed',
					}}>
					<div className={cn(isPremiumFeature && 'pointer-events-none cursor-not-allowed')}>{children}</div>
				</div>
			) : (
				children
			)}
		</div>
	);
};

export default PremiumFeature;
