import { FC } from 'react';
import { Button, Dialog } from '@/components/atoms';
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
		<Dialog
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			title={
				<span className='flex items-center gap-2'>
					<CreditCard className='size-5' />
					{t('moyasarAutopay.title')}
				</span>
			}
			className='sm:max-w-[420px]'>
			<div className='space-y-4 py-2'>
				<p className='text-sm text-gray-600'>{t('moyasarAutopay.intro')}</p>
				<Button className='w-full' onClick={handleSetupCard}>
					{t('moyasarAutopay.setupCard')}
				</Button>
			</div>
		</Dialog>
	);
};

export default MoyasarSaveCardModal;
