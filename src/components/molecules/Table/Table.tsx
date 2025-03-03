import * as React from 'react';
import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BaseColumnData<T> {
	title?: string;
	flex?: number;
	width?: number | string;
	color?: string;
	textColor?: string;
	suffixIcon?: ReactNode;
	align?: 'left' | 'center' | 'right' | 'justify';
	className?: string;
	fieldVariant?: 'default' | 'title' | 'link' | 'icon' | 'interactive';
	hideOnEmpty?: boolean;
	onCellClick?: (row: T, e: React.MouseEvent) => void;
	children?: ReactNode;
}

interface FieldNameColumn<T> extends BaseColumnData<T> {
	fieldName: keyof T;
	render?: never;
}

interface RenderColumn<T> extends BaseColumnData<T> {
	fieldName?: never;
	render: (rowData: T) => ReactNode;
}

export type ColumnData<T = any> = FieldNameColumn<T> | RenderColumn<T>;

export interface FlexpriceTableProps<T> {
	columns: ColumnData<T>[];
	data: T[];
	onRowClick?: (row: T) => void;
	showEmptyRow?: boolean;
	hideBottomBorder?: boolean;
}

// Table structure components
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
	<div className='relative w-full overflow-auto'>
		<table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
	</div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />,
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />,
);
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
	<tr
		ref={ref}
		className={cn(
			'border-b border-[#E2E8F0] h-[36px] transition-colors hover:bg-muted/50',
			'align-middle', // Vertically align middle
			className,
		)}
		{...props}
	/>
));
TableRow.displayName = 'TableRow';

interface CustomThHTMLAttributes extends React.ThHTMLAttributes<HTMLTableCellElement> {
	width?: number | string;
}

const TableHead = React.forwardRef<
	HTMLTableCellElement,
	Omit<CustomThHTMLAttributes, 'align'> & { align?: 'left' | 'center' | 'right' | 'justify' }
>(({ className, style, align = 'left', width, ...props }, ref) => (
	<th
		ref={ref}
		style={{ textAlign: align, width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined, ...style }}
		className={cn('h-12 px-4 text-[14px] font-medium text-[#64748B]', `text-${align}`, 'align-middle', className)}
		{...props}
	/>
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
	HTMLTableCellElement,
	Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> & { align?: 'left' | 'center' | 'right' | 'justify' }
>(({ className, style, align = 'left', width, ...props }, ref) => (
	<td
		ref={ref}
		style={{ textAlign: align, width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined, ...style }}
		className={cn('px-4 py-2 !max-h-9 text-[14px] font-medium', `text-${align}`, 'align-middle', className)}
		{...props}
	/>
));
TableCell.displayName = 'TableCell';

// Main FlexpriceTable Component
const FlexpriceTable: FC<FlexpriceTableProps<any>> = ({ onRowClick, columns, data, showEmptyRow, hideBottomBorder = data.length > 1 }) => {
	const isInteractiveElement = (element: HTMLElement | null): boolean => {
		if (!element) return false;

		// Check for data-interactive attribute
		if (element.getAttribute('data-interactive') === 'true') return true;

		// Check for interactive elements
		const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
		if (interactiveElements.includes(element.tagName.toLowerCase())) return true;

		// Check parent elements
		return element.closest('[data-interactive="true"]') !== null;
	};

	const handleRowClick = (row: any, e: React.MouseEvent) => {
		const target = e.target as HTMLElement;

		// Don't trigger row click if the click was on or within an interactive element
		if (isInteractiveElement(target)) {
			return;
		}

		onRowClick?.(row);
	};

	const handleCellClick = (e: React.MouseEvent, row: any, onCellClick?: (row: any, e: React.MouseEvent) => void) => {
		const target = e.target as HTMLElement;

		// Don't trigger cell click if the click was on or within an interactive element
		if (isInteractiveElement(target)) {
			return;
		}

		if (onCellClick) {
			e.stopPropagation(); // Stop row click if cell has click handler
			onCellClick(row, e);
		}
	};

	return (
		<div className={cn(!hideBottomBorder && 'border-b border-[#E2E8F0]')}>
			<Table>
				<TableHeader>
					<TableRow>
						{columns.map(({ title, flex = 1, width, color = '#64748B', align = 'left', className, children }, index) => (
							<TableHead
								key={index}
								style={{ flex: width ? undefined : flex }}
								width={width}
								align={align}
								className={cn(color ? `text-[${color}]` : 'text-muted-foreground', 'font-sans font-medium', className)}>
								{children ? children : title}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.length > 0 &&
						data?.map((row, rowIndex) => {
							const lastRow = rowIndex === data.length - 1;
							return (
								<TableRow
									onClick={(e) => handleRowClick(row, e)}
									className={cn(
										'transition-colors hover:bg-muted/50',
										!lastRow && 'border-b border-[#E2E8F0]',
										onRowClick && 'cursor-pointer hover:bg-muted/50',
										lastRow && hideBottomBorder && 'border-b-0',
									)}
									key={rowIndex}>
									{columns.map(
										(
											{
												fieldName: name,
												flex = 1,
												width,
												textColor = 'inherit',
												align = 'left',
												render,
												onCellClick: onCLick,
												suffixIcon,
												fieldVariant = 'default',
											},
											colIndex,
										) => {
											return (
												<TableCell
													onClick={(e) => handleCellClick(e, row, onCLick)}
													key={colIndex}
													data-interactive={fieldVariant === 'interactive'}
													className={cn(
														textColor ? `text-[${textColor}]` : 'text-muted-foreground',
														'font-normal',
														'!max-h-8 px-3 py-2 text-[14px]',
														onCLick && 'cursor-pointer hover:bg-muted/50',
														fieldVariant === 'title' ? 'font-medium text-foreground' : '!font-normal text-muted-foreground',
														fieldVariant === 'link' && 'cursor-pointer text-primary hover:underline',
														fieldVariant === 'icon' && 'w-10',
														fieldVariant === 'interactive' && 'cursor-default',
													)}
													style={{ flex: width ? undefined : flex }}
													width={width}
													align={align}>
													{render ? (
														<div
															data-interactive={fieldVariant === 'interactive'}
															className={cn(
																onCLick && 'cursor-pointer',
																fieldVariant === 'interactive' && 'data-interactive="true"',
																fieldVariant === 'link' && 'cursor-pointer hover:underline',
															)}>
															{render(row)}
															{suffixIcon && suffixIcon}
														</div>
													) : (
														<div className={cn(onCLick && 'cursor-pointer', fieldVariant === 'link' && 'cursor-pointer hover:underline')}>
															{row[name]}
														</div>
													)}
												</TableCell>
											);
										},
									)}
								</TableRow>
							);
						})}
					{data.length === 0 && showEmptyRow && (
						<TableRow className={cn(hideBottomBorder && 'border-b-0')}>
							{columns.map(({ flex = 1, width, textColor = 'inherit', align = 'left', hideOnEmpty }, colIndex) => {
								const lastRow = colIndex === columns.length - 1;
								return (
									<TableCell
										key={colIndex}
										className={cn(
											textColor ? `text-[${textColor}]` : 'text-[#09090B] w-full ',
											'font-normal',
											'!max-h-8 px-4 py-2 text-[14px]',
											lastRow ? 'text-center' : '',
										)}
										style={{ flex: width ? undefined : flex }}
										width={width}
										align={align}>
										{lastRow && hideOnEmpty ? '' : '--'}
									</TableCell>
								);
							})}
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};

export default FlexpriceTable;
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
