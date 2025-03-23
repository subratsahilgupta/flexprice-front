import { FC, useEffect, useState } from 'react';
import DocsDrawer from '../DocsDrawer/DocsDrawer';
import { CodeSnippet, useApiDocsStore } from '@/store/useApiDocsStore';
import { useDocs } from '@/context/DocsContext';
import { Button } from '@/components/atoms';
import { Code2 } from 'lucide-react';

const ApiDocs: FC = () => {
	const [isDocsOpen, setIsDocsOpen] = useState(false);
	const { docsUrl, snippets } = useApiDocsStore();

	// Don't render anything if no documentation is configured
	if (!docsUrl || snippets.length === 0) {
		return null;
	}

	return (
		<div className='flex items-center gap-4'>
			<button className='text-sm text-gray-500 hover:text-gray-800'>Help</button>
			<DocsDrawer
				isOpen={isDocsOpen}
				onOpenChange={setIsDocsOpen}
				docsUrl={docsUrl}
				snippets={snippets}
				trigger={
					<Button variant='outline' className='outlin text-sm bg-gray-100 flex items-center gap-2' size='sm'>
						<Code2 className='w-4 h-4' />
						Api
					</Button>
				}
			/>
		</div>
	);
};

interface ApiDocsContentProps {
	docsUrl: string;
	snippets: CodeSnippet[];
}

export const ApiDocsContent = ({ docsUrl, snippets }: ApiDocsContentProps) => {
	const { setPageDocs, clearPageDocs } = useDocs();

	useEffect(() => {
		setPageDocs(docsUrl, snippets);
		return () => clearPageDocs();
	}, [docsUrl, snippets]);

	return null;
};

export default ApiDocs;
