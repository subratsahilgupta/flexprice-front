import { FC } from 'react';
import { HighlightProps, Highlight, themes } from 'prism-react-renderer';
import { cn } from '@/lib/utils';
import Spacer from '../Spacer';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../Button';

const CodeHighlighter = Highlight as unknown as FC<HighlightProps>;

interface Props {
	code: string;
	language?: string;
	title?: string;
	className?: string;
}

const CodePreview: FC<Props> = ({ code, language, className: styles, title }) => {
	return (
		<>
			<div className={cn(' bg-[#FAFAFA] p-6 border rounded-lg')}>
				<div className='flex justify-between items-center w-full'>
					<p className='font-semibold text-lg'>{title}</p>
					<Button
						onClick={() => {
							navigator.clipboard.writeText(code);
							toast.success('Copied to clipboard');
						}}
						className='text-muted-foreground cursor-pointer absolute top-4 right-4 size-8'
						variant={'ghost'}>
						<Copy className='' />
					</Button>
				</div>
				<Spacer className='!h-6' />
				<CodeHighlighter theme={themes.oneLight} code={code} language={language ?? 'bash'}>
					{({ className, style, tokens, getLineProps, getTokenProps }) => (
						<pre className={cn(className, styles)} style={{ ...style, padding: '0.5rem', borderRadius: '8px', overflowX: 'auto' }}>
							{tokens.map((line, i) => (
								<div key={i} {...getLineProps({ line })}>
									{line.map((token, key) => (
										<span key={key} {...getTokenProps({ token })} className='font-fira-code text-xs' />
									))}
								</div>
							))}
						</pre>
					)}
				</CodeHighlighter>
			</div>
		</>
	);
};

export default CodePreview;
