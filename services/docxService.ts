import type { ProjectPlan } from '../types';

// The 'docx' library is loaded from a CDN in index.html and is available as a global variable.
declare const docx: any;

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportPlanAsDocx = async (plan: ProjectPlan, projectName: string) => {
  if (typeof docx === 'undefined') {
    console.error('DOCX.js library is not loaded.');
    alert('Error: Document generation library is not available.');
    return;
  }
  
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = docx;
  
  const sections = [];

  // Title
  sections.push(new Paragraph({ text: `Project Plan: ${projectName}`, heading: HeadingLevel.TITLE }));
  sections.push(new Paragraph({ text: '' })); // Spacer

  // Summary
  sections.push(new Paragraph({ text: '1. Project Summary', heading: HeadingLevel.HEADING_1 }));
  sections.push(new Paragraph(plan.summary));
  sections.push(new Paragraph({ text: '' }));

  // Key Components
  sections.push(new Paragraph({ text: '2. Key Components', heading: HeadingLevel.HEADING_1 }));
  plan.keyComponents.forEach(c => sections.push(new Paragraph({ text: c, bullet: { level: 0 } })));
  sections.push(new Paragraph({ text: '' }));
  
  // Tech Stack
  sections.push(new Paragraph({ text: '3. Recommended Technology Stack', heading: HeadingLevel.HEADING_1 }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'Frontend: ', bold: true }), new TextRun(plan.recommendedTechStack.frontend.join(', '))] }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'Backend: ', bold: true }), new TextRun(plan.recommendedTechStack.backend.join(', '))] }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'Database: ', bold: true }), new TextRun(plan.recommendedTechStack.database.join(', '))] }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'Other: ', bold: true }), new TextRun(plan.recommendedTechStack.other.join(', '))] }));
  sections.push(new Paragraph({ text: '' }));
  
  // Challenges
  sections.push(new Paragraph({ text: '4. Potential Challenges', heading: HeadingLevel.HEADING_1 }));
  plan.potentialChallenges.forEach(c => sections.push(new Paragraph({ text: c, bullet: { level: 0 } })));
  sections.push(new Paragraph({ text: '' }));
  
  // Opportunities
  sections.push(new Paragraph({ text: '5. Potential Opportunities', heading: HeadingLevel.HEADING_1 }));
  plan.potentialOpportunities.forEach(o => sections.push(new Paragraph({ text: o, bullet: { level: 0 } })));
  sections.push(new Paragraph({ text: '' }));

  // Detailed Features
  sections.push(new Paragraph({ text: '6. Detailed Feature Specifications', heading: HeadingLevel.HEADING_1 }));
  plan.detailedFeatures.forEach(f => {
    sections.push(new Paragraph({ text: f.name, heading: HeadingLevel.HEADING_2 }));
    sections.push(new Paragraph(f.description));
    sections.push(new Paragraph({ text: 'Main Functions', heading: HeadingLevel.HEADING_3 }));
    f.mainFunctions.forEach(mf => sections.push(new Paragraph({ text: mf, bullet: { level: 0 } })));
    sections.push(new Paragraph({ text: 'Sub-Features', heading: HeadingLevel.HEADING_3 }));
    f.subFeatures.forEach(sf => sections.push(new Paragraph({ text: sf, bullet: { level: 0 } })));
    sections.push(new Paragraph({ text: '' }));
  });

  // Development Plan
  sections.push(new Paragraph({ text: '7. Development Plan (Milestones)', heading: HeadingLevel.HEADING_1 }));
  plan.developmentPlan.milestones.forEach(m => {
    sections.push(new Paragraph({ text: m.name, heading: HeadingLevel.HEADING_2 }));
    sections.push(new Paragraph(m.description));
    sections.push(new Paragraph({ text: 'Key Tasks:', heading: HeadingLevel.HEADING_3 }));
    m.tasks.forEach(t => sections.push(new Paragraph({ text: t, bullet: { level: 0 } })));
    sections.push(new Paragraph({ text: '' }));
  });

  const doc = new Document({
    sections: [{ children: sections }]
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${projectName.replace(/\s+/g, '_')}_Plan.docx`);
};


export const exportReportAsDocx = async (reportContent: string, projectName: string, reportTitle: string) => {
    if (typeof docx === 'undefined') {
        console.error('DOCX.js library is not loaded.');
        alert('Error: Document generation library is not available.');
        return;
    }
    
    const { Document, Packer, Paragraph, HeadingLevel } = docx;

    const children: any[] = [];
    children.push(new Paragraph({ text: reportTitle, heading: HeadingLevel.TITLE }));
    children.push(new Paragraph({ text: `For Project: ${projectName}`, heading: HeadingLevel.HEADING_3 }));
    children.push(new Paragraph({ text: '' })); // Spacer
    
    const lines = reportContent.split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('### ')) {
            children.push(new Paragraph({ text: trimmedLine.substring(4), heading: HeadingLevel.HEADING_3 }));
        } else if (trimmedLine.startsWith('## ')) {
            children.push(new Paragraph({ text: trimmedLine.substring(3), heading: HeadingLevel.HEADING_2 }));
        } else if (trimmedLine.startsWith('# ')) {
            children.push(new Paragraph({ text: trimmedLine.substring(2), heading: HeadingLevel.HEADING_1 }));
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            // Handle nested bullets, simple version
            const bulletText = trimmedLine.replace(/^[-*]\s+/, '');
            const indentation = (trimmedLine.match(/^\s*/)?.[0].length ?? 0) / 2; // Simple indent detection
            children.push(new Paragraph({ text: bulletText, bullet: { level: Math.min(indentation, 4) } }));
        } else if (trimmedLine !== '') {
            children.push(new Paragraph(trimmedLine));
        } else {
             children.push(new Paragraph({ text: '' })); // Preserve empty lines for spacing
        }
    }

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const filename = `${projectName.replace(/\s+/g, '_')}_${reportTitle.replace(/\s+/g, '_')}.docx`;
    downloadBlob(blob, filename);
};
