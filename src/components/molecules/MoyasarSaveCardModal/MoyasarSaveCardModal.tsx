import { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { Button } from '@/components/atoms';
import { CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { RouteNames } from '@/core/routes/Routes';

interface MoyasarSaveCardModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	customerId: string;
}

const MoyasarSaveCardModal: FC<MoyasarSaveCardModalProps> = ({ isOpen, onOpenChange, customerId }) => {
	const { t } = useTranslation('customers');
	const navigate = useNavigate();

	const handleSetupCard = () => {
		onOpenChange(false);
		navigate(`${RouteNames.moyasarCheckout}?customer_id=${encodeURIComponent(customerId)}`);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className='bg-white sm:max-w-[420px]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-lg font-semibold text-[#18181B]'>
						<CreditCard className='size-5' />
						{t('moyasarAutopay.title')}
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-4 py-2'>
					<p className='text-sm text-gray-600'>{t('moyasarAutopay.intro')}</p>
					<Button className='w-full' onClick={handleSetupCard}>
						{t('moyasarAutopay.setupCard', 'Set up card')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default MoyasarSaveCardModal;
