import { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Highlight, themes } from 'prism-react-renderer';

interface JsonEditorProps {
	value: Record<string, unknown> | null | undefined;
	onChange: (value: Record<string, unknown> | null, raw: string) => void;
}

const EMPTY_TEMPLATE = '{\n  \n}';

const formatJson = (obj: Record<string, unknown>): string => JSON.stringify(obj, null, 2);

const tryParse = (text: string): Record<string, unknown> | null => {
	try {
		const parsed = JSON.parse(text);
		if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
			return parsed as Record<string, unknown>;
		}
	} catch {
		// fall through
	}
	return null;
};

// Shared metrics — textarea and <pre> MUST match exactly so the caret aligns
// with the highlighted text underneath. Lines wrap (no horizontal scroll) which
// keeps the two layers in lockstep regardless of content width.
const sharedTextStyle: CSSProperties = {
	fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
	fontSize: '13px',
	lineHeight: '1.5',
	padding: '16px',
	whiteSpace: 'pre-wrap',
	wordBreak: 'break-word',
	overflowWrap: 'break-word',
	tabSize: 2,
	margin: 0,
	border: 0,
};

export const JsonEditor: FC<JsonEditorProps> = ({ value, onChange }) => {
	const { t } = useTranslation('catalog');
	const [rawText, setRawText] = useState<string>(EMPTY_TEMPLATE);
	const [error, setError] = useState<string>('');
	const seeded = useRef(false);

	// Seed once from the incoming value
	useEffect(() => {
		if (seeded.current) return;
		seeded.current = true;
		setRawText(value && Object.keys(value).length > 0 ? formatJson(value) : EMPTY_TEMPLATE);
	}, [value]);

	const handleChange = (text: string) => {
		setRawText(text);
		const parsed = tryParse(text);
		if (parsed) {
			setError('');
			onChange(parsed, text);
		} else if (text.trim() === '' || text.trim() === '{}') {
			setError('');
		} else {
			setError(t('jsonEditor.errorInvalidJson'));
			// Don't propagate invalid JSON — keeps the parent's last valid value
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		const parsed = tryParse(e.clipboardData.getData('text'));
		if (parsed) {
			e.preventDefault();
			handleChange(formatJson(parsed));
		}
	};

	const lineCount = rawText.split('\n').length;

	return (
		<div className='rounded-lg overflow-hidden border border-gray-200' style={{ background: themes.nightOwl.plain.backgroundColor }}>
			{/* Header — mirrors JsonCodeBlock */}
			<div className='px-4 py-2 border-b border-white/10 flex items-center justify-between'>
				<p className='text-xs font-medium text-slate-300'>{t('jsonEditor.title')}</p>
				<span className='text-xs text-slate-400'>{lineCount} {t('jsonEditor.lines')}</span>
			</div>

			{/* Editor: highlighted <pre> defines the height, transparent textarea overlays it */}
			<div className='relative max-h-96 overflow-auto'>
				<Highlight theme={themes.nightOwl} code={rawText || EMPTY_TEMPLATE} language='json'>
					{({ tokens, getLineProps, getTokenProps }) => (
						<pre aria-hidden style={{ ...sharedTextStyle, minHeight: '16rem', background: 'transparent', pointerEvents: 'none' }}>
							{tokens.map((line, i) => (
								<div key={i} {...getLineProps({ line })}>
									{line.map((token, key) => (
										<span key={key} {...getTokenProps({ token })} />
									))}
								</div>
							))}
						</pre>
					)}
				</Highlight>
				<textarea
					value={rawText}
					onChange={(e) => handleChange(e.target.value)}
					onPaste={handlePaste}
					spellCheck={false}
					className='absolute inset-0 w-full h-full resize-none outline-none'
					style={{ ...sharedTextStyle, background: 'transparent', color: 'transparent', caretColor: '#c5e4fd', overflow: 'hidden' }}
				/>
			</div>

			{/* Status bar */}
			<div className='px-4 py-1.5 border-t border-white/10'>
				<span className={error ? 'text-xs text-red-400' : 'text-xs text-slate-400'}>{error || t('jsonEditor.validJson')}</span>
			</div>
		</div>
	);
};

export default JsonEditor;
