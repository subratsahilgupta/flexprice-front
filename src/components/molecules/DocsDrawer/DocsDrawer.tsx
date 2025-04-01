import { FC, useState } from 'react';
import { Sheet } from '@/components/atoms';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { SupportedLanguage } from '@/utils/curlConverter';
import { Highlight, themes } from 'prism-react-renderer';
import { ApiDocsSnippet } from '@/store/useApiDocsStore';

interface Props {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	snippets: ApiDocsSnippet[];
	trigger?: React.ReactNode;
}

interface SnippetBlockProps {
	snippet: ApiDocsSnippet;
}

const languageMap: Record<SupportedLanguage, string> = {
	// cURL: 'bash',
	cURL: 'javascript',
	Python: 'python',
	JavaScript: 'javascript',
	PHP: 'php',
	Go: 'go',
	Java: 'java',
	Ruby: 'ruby',
	Swift: 'swift',
	'C#': 'csharp',
};

const SnippetBlock: FC<SnippetBlockProps> = ({ snippet }) => {
	const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('cURL');
	const languages: SupportedLanguage[] = ['cURL', 'Python', 'JavaScript', 'PHP', 'Go', 'Java', 'Ruby', 'Swift', 'C#'];

	const getCode = () => {
		return selectedLanguage === 'cURL' ? snippet.curl : snippet[selectedLanguage];
	};

	const handleCopyCode = () => {
		const code = getCode();
		navigator.clipboard.writeText(code);
		toast.success('Code copied to clipboard!');
	};

	return (
		<div className='mb-8 last:mb-0'>
			<h3 className='text-lg font-normal text-foreground'>{snippet.label}</h3>
			{snippet.description && <p className='text-sm text-gray-400'>{snippet.description}</p>}
			<div className='rounded-lg overflow-hidden border border-gray-200 mt-3'>
				{/* Language Tabs */}
				<div className='flex overflow-x-auto bg-gray-50 border-b border-gray-200'>
					{languages.map((lang) => (
						<button
							key={lang}
							onClick={() => setSelectedLanguage(lang)}
							className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
								selectedLanguage === lang
									? 'text-blue-600 border-b-2 border-blue-600 bg-white'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
							}`}>
							{lang}
						</button>
					))}
				</div>

				{/* Code Block */}
				<div className='relative'>
					<Highlight theme={themes.nightOwl} code={getCode()} language={languageMap[selectedLanguage]}>
						{({ className, style, tokens, getLineProps, getTokenProps }) => (
							<pre className={`${className} p-4 overflow-x-auto`} style={style}>
								{tokens.map((line, i) => (
									<div key={i} {...getLineProps({ line })}>
										{line.map((token, key) => (
											<span key={key} {...getTokenProps({ token })} className='text-sm font-normal font-fira-code' />
										))}
									</div>
								))}
							</pre>
						)}
					</Highlight>
					<button
						onClick={handleCopyCode}
						className='absolute top-3 right-3 p-2 bg-gray-800/30 hover:bg-gray-800/50 rounded-md text-white transition-colors'
						title='Copy to clipboard'>
						<Copy size={16} />
					</button>
				</div>
			</div>
		</div>
	);
};

const DocsDrawer: FC<Props> = ({ isOpen, onOpenChange, snippets, trigger }) => {
	return (
		<Sheet isOpen={isOpen} onOpenChange={onOpenChange} title='API Reference' trigger={trigger} size='lg'>
			<div className='flex flex-col h-full'>
				{snippets.length === 0 && <p className='text-sm text-gray-400'>No documentation found</p>}

				{/* Code Snippets Section */}
				<div className='my-6 px-1 pb-8'>
					{snippets.map((snippet, index) => (
						<SnippetBlock key={index} snippet={snippet} />
					))}
				</div>
			</div>
		</Sheet>
	);
};

export default DocsDrawer;
