const downloadPdf = (pdf: any, filename: string) => {
  pdf.save(filename);
};

export const exportPlanAsPdf = async (elementId: string, projectName: string) => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const element = document.getElementById(elementId);
    if (!element) {
      console.error('❌ Element not found:', elementId);
      return;
    }

    console.log('🚀 Starting PDF export for project:', projectName);

    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true, // Handle cross-origin images
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Project_Plan.pdf`;
    downloadPdf(pdf, filename);
    console.log('✅ PDF export completed successfully');
  } catch (error) {
    console.error('❌ PDF export failed:', error);
    alert('Failed to export PDF');
  }
};
