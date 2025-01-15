import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures a React component by ref and generates a downloadable PDF.
 * @param elementRef - A React ref to the DOM element to capture.
 * @param pdfFileName - The name of the generated PDF file.
 */ export const captureToPdf = async (elementRef: React.RefObject<HTMLElement>, pdfFileName: string) => {
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
			format: [canvas.width, canvas.height],
		});

		const pageHeight = pdf.internal.pageSize.height;

		// If content exceeds the page height, add more pages
		let currentHeight = 0;
		while (currentHeight < canvas.height) {
			pdf.addImage(imgData, 'PNG', 0, currentHeight, canvas.width, canvas.height);
			currentHeight += pageHeight;

			// Add a new page if there's more content to capture
			if (currentHeight < canvas.height) {
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
