import { Button, SectionHeader } from '@/components/atoms';
import { ImportFileDrawer } from '@/components/molecules';
import { Import } from 'lucide-react';
import { useState } from 'react';

const ImportExport = () => {
	const [drawerOpen, setdrawerOpen] = useState(false);

	return (
		<div className='page'>
			{/* import export drawer */}
			<ImportFileDrawer isOpen={drawerOpen} onOpenChange={(value) => setdrawerOpen(value)} />

			<SectionHeader title='Bulk Imports'>
				<Button onClick={() => setdrawerOpen(true)} className='flex gap-2 items-center '>
					<Import />
					<span>Import File</span>
				</Button>
			</SectionHeader>
		</div>
	);
};

export default ImportExport;
