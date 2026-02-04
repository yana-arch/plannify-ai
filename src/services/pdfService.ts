import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const exportPlanAsPdf = async (projectName: string) => {
  const element = document.getElementById("project-plan-content");
  if (!element) {
    console.error("Project plan content element not found");
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Improve quality
      useCORS: true, // Handle external images if any
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, "_")}_Project_Plan.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Failed to export PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};
