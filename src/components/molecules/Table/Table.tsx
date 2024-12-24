import * as React from 'react';
import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ColumnData {
	name: string;
	title: string;
	flex?: number;
	width?: number | string;
	color?: string;
	textColor?: string;
	suffixIcon?: ReactNode;
	align?: 'left' | 'center' | 'right' | 'justify';
	render?: (rowData: any) => ReactNode;
	children: ReactNode;
	className?: string;
}

export interface FlexpriceTableProps {
	columns: ColumnData[];
	data: any[];
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
		className={cn(
			'h-12 px-4 text-[14px] font-medium text-[#64748B]',
			`text-${align}`, // Apply horizontal alignment
			'align-middle', // Vertically align middle
			className,
		)}
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
		className={cn('p-4 text-[14px] font-medium', `text-${align}`, 'align-middle', className)}
		{...props}
	/>
));
TableCell.displayName = 'TableCell';

// Main FlexpriceTable Component
const FlexpriceTable: FC<FlexpriceTableProps> = ({ columns, data }) => {
	return (
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
				{data.map((row, rowIndex) => (
					<TableRow key={rowIndex}>
						{columns.map(({ name, flex = 1, width, textColor = 'inherit', align = 'left', render }, colIndex) => (
							<TableCell
								key={colIndex}
								className={cn(textColor ? `text-[${textColor}]` : 'text-[#09090B]', 'text-inherit', 'max-h-8 px-4 py-3 text-[14px]')}
								style={{ flex: width ? undefined : flex }}
								width={width}
								align={align}>
								{render ? render(row) : row[name]}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default FlexpriceTable;
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
