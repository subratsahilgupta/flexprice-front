import * as React from 'react';
import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface BaseColumnData<T = any> {
	title?: string;
	flex?: number;
	width?: number | string;
	color?: string;
	textColor?: string;
	suffixIcon?: ReactNode;
	align?: 'left' | 'center' | 'right' | 'justify';
	children?: ReactNode;
	className?: string;
	redirect?: boolean;
	hideOnEmpty?: boolean;
	onCLick?: (row: T) => void;
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

export interface FlexpriceTableProps {
	columns: ColumnData[];
	redirectUrl?: string;
	data: any[];
	onRowClick?: (row: any) => void;
	showEmptyRow?: boolean;
	emptyRowText?: string;
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
	({ className, ...props }, ref) => (
		<tbody ref={ref} className={cn('border-b border-[#E2E8F0] [&_tr:last-child]:border-0', className)} {...props} />
	),
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
const FlexpriceTable: FC<FlexpriceTableProps> = ({ onRowClick, columns, data, redirectUrl, showEmptyRow, emptyRowText }) => {
	const navigate = useNavigate();
	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						{columns.map(({ title, flex = 1, width, color = '#64748B', align = 'left', children, className }, index) => (
							<TableHead
								key={index}
								style={{ flex: width ? undefined : flex }}
								width={width}
								align={align}
								className={cn(color ? `text-[${color}]` : 'text-[#64748B]', className)}>
								{children ? children : title}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.length > 0 &&
						data?.map((row, rowIndex) => (
							<TableRow
								onClick={() => {
									if (onRowClick) {
										onRowClick(row);
									}
								}}
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
											redirect = true,
											onCLick,
											suffixIcon,
										},
										colIndex,
									) => (
										<TableCell
											onClick={() => {
												if (redirect && redirectUrl) {
													navigate(`${redirectUrl}${row?.id}`);
												} else if (onCLick) {
													onCLick(row);
												}
											}}
											key={colIndex}
											className={cn(
												textColor ? `text-[${textColor}]` : 'text-[#09090B] w-full ',
												'font-normal',
												'!max-h-8 px-4 py-2 text-[14px]',
												(redirect && redirectUrl) || onCLick ? 'cursor-pointer' : 'cursor-default',
											)}
											style={{ flex: width ? undefined : flex }}
											width={width}
											align={align}>
											{render ? (
												<span className={cn((redirect && redirectUrl) || onCLick ? 'cursor-pointer' : 'cursor-default')}>
													{render(row)}
													{suffixIcon && suffixIcon}
												</span>
											) : (
												row[name]
											)}
										</TableCell>
									),
								)}
							</TableRow>
						))}
					{data.length === 0 && showEmptyRow && (
						<TableRow>
							{columns.map(({ flex = 1, width, textColor = 'inherit', align = 'left', redirect = true, hideOnEmpty }, colIndex) => {
								const lastRow = colIndex === columns.length - 1;
								return (
									<TableCell
										key={colIndex}
										className={cn(
											textColor ? `text-[${textColor}]` : 'text-[#09090B] w-full ',
											'font-normal',
											'!max-h-8 px-4 py-2 text-[14px]',
											redirect && redirectUrl ? 'cursor-pointer' : 'cursor-default',
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
			{data.length === 0 && !showEmptyRow && <p className=' text-[#64748B] text-xs font-normal font-sans mt-4'>{emptyRowText}</p>}
		</div>
	);
};

export default FlexpriceTable;
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
