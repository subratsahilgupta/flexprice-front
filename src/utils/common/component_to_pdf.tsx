import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures a React component by ref and generates a downloadable PDF.
 * @param elementRef - A React ref to the DOM element to capture.
 * @param pdfFileName - The name of the generated PDF file.
 */

export const captureToPdf = async (elementRef: React.RefObject<HTMLElement>, pdfFileName: string) => {
	if (!elementRef.current) {
		console.error('Element not found in ref:', elementRef);
		return;
	}

	try {
		// Convert the element into a canvas with scale for better quality
		const canvas = await html2canvas(elementRef.current, { scale: 2, useCORS: true });
		const imgData = canvas.toDataURL('image/png');

		// Create a new PDF document
		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'px',
			format: [2100, 2970], // A4 size in pixels at 72 DPI (customizable as needed)
		});

		const pageHeight = pdf.internal.pageSize.height;
		const pageWidth = pdf.internal.pageSize.width;

		const contentHeight = canvas.height;
		const contentWidth = canvas.width;

		// Start with the first page
		let currentHeight = 0;

		// Check if the content height exceeds a single page and split accordingly
		while (currentHeight < contentHeight) {
			const remainingHeight = contentHeight - currentHeight;

			// Calculate the section to be added based on the current height
			const sectionHeight = Math.min(remainingHeight, pageHeight);

			pdf.addImage(imgData, 'PNG', 0, currentHeight, pageWidth, (sectionHeight * pageWidth) / contentWidth);

			currentHeight += sectionHeight;

			// If there is more content, add a new page
			if (currentHeight < contentHeight) {
				pdf.addPage();
			}
		}

		// Save the generated PDF
		pdf.save(`${pdfFileName}.pdf`);
		console.log('PDF generated successfully!');
	} catch (error) {
		console.error('Error generating PDF:', error);
	}
};
