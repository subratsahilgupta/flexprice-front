import { useSearchParams } from 'react-router-dom';
import {
	Pagination,
	PaginationContent,
	PaginationLink,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
	// PaginationEllipsis,
} from '@/components/ui/pagination';
import { Spacer } from '@/components/atoms';
import { cn } from '@/lib/utils';

const FLexpricePagination = ({ totalPages }: { totalPages: number }) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentPage = parseInt(searchParams.get('page') || '1', 10);

	const handlePageChange = (page: number) => {
		if (page < 1 || page > totalPages) return;
		setSearchParams({ page: page.toString() });
	};

	if (totalPages <= 1) return null;

	return (
		<div className='!mb-6'>
			<Spacer className='!my-4' />
			<Pagination>
				<PaginationContent>
					{/* Previous Button */}
					<PaginationItem>
						<PaginationPrevious
							onClick={() => handlePageChange(currentPage - 1)}
							className={cn(currentPage === 1 && 'text-zinc-500 select-none cursor-not-allowed hover:bg-white   hover:text-zinc-500')}
							disabled={currentPage === 1}
						/>
					</PaginationItem>

					{/* Pagination Items */}
					{Array.from({ length: totalPages }, (_, index) => {
						const page = index + 1;
						return (
							<PaginationItem className={cn('cursor-pointer')} key={page}>
								<PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page)}>
									{page}
								</PaginationLink>
							</PaginationItem>
						);
					})}

					{/* Ellipsis (Optional for large pagination ranges) */}
					{/* {totalPages > 15 && (
						<PaginationItem>
							<PaginationEllipsis />
						</PaginationItem>
					)} */}

					{/* Next Button */}
					<PaginationItem>
						<PaginationNext
							onClick={() => handlePageChange(currentPage + 1)}
							className={cn(
								currentPage === totalPages && 'text-zinc-500 select-none cursor-not-allowed hover:bg-white hover:text-zinc-500',
							)}
							disabled={currentPage === totalPages}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
};

export default FLexpricePagination;
