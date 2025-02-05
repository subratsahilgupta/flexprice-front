import { FC } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { cn } from '@/lib/utils';

interface Props {
	code: string;
	language?: string;
	className?: string;
}

const CodePreview: FC<Props> = ({ code, language, className: styles }) => {
	return (
		<Highlight theme={themes.nightOwl} code={code} language={language ?? 'bash'}>
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
		</Highlight>
	);
};

export default CodePreview;
