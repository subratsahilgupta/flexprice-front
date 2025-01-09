import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
	Pagination,
	PaginationContent,
	PaginationLink,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
	PaginationEllipsis,
} from '@/components/ui/pagination'; // Adjust import path as necessary

const FLexpricePagination = ({ totalPages }: { totalPages: number }) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentPage = parseInt(searchParams.get('page') || '1', 10);

	const handlePageChange = (page: number) => {
		setSearchParams({ page: page.toString() });
	};

	return (
		<Pagination>
			<PaginationContent>
				{/* Previous Button */}
				<PaginationItem>
					<PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
				</PaginationItem>

				{/* Pagination Items */}
				{Array.from({ length: totalPages }, (_, index) => {
					const page = index + 1;
					return (
						<PaginationItem key={page}>
							<PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page)}>
								{page}
							</PaginationLink>
						</PaginationItem>
					);
				})}

				{/* Ellipsis (Optional for large pagination ranges) */}
				{totalPages > 5 && (
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				)}

				{/* Next Button */}
				<PaginationItem>
					<PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};

export default FLexpricePagination;
