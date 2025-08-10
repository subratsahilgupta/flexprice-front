import { AddonDrawer } from '@/components/molecules';
import { useState } from 'react';

const AddOn = () => {
	const [isOpen, setIsOpen] = useState(true);

	return <AddonDrawer open={isOpen} onOpenChange={setIsOpen} refetchQueryKeys={['fetchAddons']} />;
};

export default AddOn;
