import type { ProjectPlan } from '../types';
import * as docx from 'docx';
import MarkdownIt from 'markdown-it';

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

  const { Document, Packer, Paragraph, HeadingLevel, TextRun, PageBreak } = docx;

  const sections = [];

  // Title
  sections.push(new Paragraph({ text: `Project Plan: ${projectName}`, heading: HeadingLevel.TITLE }));
  sections.push(new Paragraph({ text: '' })); // Spacer

  // Summary
  sections.push(new Paragraph({ text: '1. Project Summary', heading: HeadingLevel.HEADING_1 }));
  sections.push(new Paragraph(plan.summary));
  sections.push(new Paragraph({ text: '' }));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Key Components
  sections.push(new Paragraph({ text: '2. Key Components', heading: HeadingLevel.HEADING_1 }));
  plan.keyComponents.forEach(c => sections.push(new Paragraph({ text: c, bullet: { level: 0 } })));
  sections.push(new Paragraph({ text: '' }));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Tech Stack
  sections.push(new Paragraph({ text: '3. Recommended Technology Stack', heading: HeadingLevel.HEADING_1 }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'Frontend: ', bold: true }), new TextRun(plan.recommendedTechStack.frontend.join(', '))] }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'Backend: ', bold: true }), new TextRun(plan.recommendedTechStack.backend.join(', '))] }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'Database: ', bold: true }), new TextRun(plan.recommendedTechStack.database.join(', '))] }));
  sections.push(new Paragraph({ children: [new TextRun({ text: 'Other: ', bold: true }), new TextRun(plan.recommendedTechStack.other.join(', '))] }));
  sections.push(new Paragraph({ text: '' }));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Challenges
  sections.push(new Paragraph({ text: '4. Potential Challenges', heading: HeadingLevel.HEADING_1 }));
  plan.potentialChallenges.forEach(c => sections.push(new Paragraph({ text: c, bullet: { level: 0 } })));
  sections.push(new Paragraph({ text: '' }));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Opportunities
  sections.push(new Paragraph({ text: '5. Potential Opportunities', heading: HeadingLevel.HEADING_1 }));
  plan.potentialOpportunities.forEach(o => sections.push(new Paragraph({ text: o, bullet: { level: 0 } })));
  sections.push(new Paragraph({ text: '' }));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

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
  sections.push(new Paragraph({ children: [new PageBreak()] }));

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
    styles: {
      paragraphStyles: [
        {
          id: 'DefaultStyle',
          name: 'Default Style',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            size: 24, // 12pt font size
            font: 'Calibri',
          },
          paragraph: {
            spacing: {
              after: 200, // line spacing
            },
          },
        },
        {
          id: 'Title',
          name: 'Title',
          basedOn: 'Normal',
          run: {
            size: 32, // 16pt for title
            bold: true,
            font: 'Calibri',
          },
          paragraph: {
            spacing: {
              before: 1000,
              after: 1000,
            },
          },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          run: {
            size: 28, // 14pt for H1
            bold: true,
            font: 'Calibri',
          },
          paragraph: {
            spacing: {
              before: 800,
              after: 400,
            },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          run: {
            size: 26, // 13pt for H2
            bold: true,
            font: 'Calibri',
          },
          paragraph: {
            spacing: {
              before: 600,
              after: 300,
            },
          },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          run: {
            size: 24, // 12pt for H3
            italics: true,
            font: 'Calibri',
          },
          paragraph: {
            spacing: {
              before: 400,
              after: 200,
            },
          },
        },
      ],
    },
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

    const { Document, Packer, Paragraph, HeadingLevel, PageBreak, TextRun } = docx;

    // Initialize markdown-it parser
    const md = new MarkdownIt();

    const children: any[] = [];
    children.push(new Paragraph({ text: reportTitle, heading: HeadingLevel.TITLE }));
    children.push(new Paragraph({ text: `For Project: ${projectName}`, heading: HeadingLevel.HEADING_3 }));
    children.push(new Paragraph({ text: '' })); // Spacer

    // Parse markdown content using markdown-it
    const tokens = md.parse(reportContent, {});
    let bulletStack: number[] = [];
    let currentBulletLevel = 0;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'heading_open') {
            const level = parseInt(token.tag.substring(1));

            // Add page break before H2 headings (major sections)
            if (level === 2) {
                children.push(new Paragraph({ children: [new PageBreak()] }));
            }

            const nextToken = tokens[i + 1];
            if (nextToken && nextToken.type === 'inline') {
                const headingText = nextToken.content;

                switch (level) {
                    case 1:
                        children.push(new Paragraph({ text: headingText, heading: HeadingLevel.HEADING_1 }));
                        break;
                    case 2:
                        children.push(new Paragraph({ text: headingText, heading: HeadingLevel.HEADING_2 }));
                        break;
                    case 3:
                        children.push(new Paragraph({ text: headingText, heading: HeadingLevel.HEADING_3 }));
                        break;
                    case 4:
                        children.push(new Paragraph({ text: headingText, heading: HeadingLevel.HEADING_4 }));
                        break;
                    default:
                        children.push(new Paragraph({ text: headingText, heading: HeadingLevel.HEADING_1 }));
                }
            }
        } else if (token.type === 'paragraph_open') {
            const nextToken = tokens[i + 1];
            if (nextToken && nextToken.type === 'inline') {
                const paragraphText = nextToken.content;

                if (paragraphText.trim()) {
                    // Check for bold and italic formatting
                    const formattedChildren: any[] = [];
                    let lastEnd = 0;

                    // Simple regex to find **bold** and *italic* text
                    const boldItalicRegex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
                    let match;

                    while ((match = boldItalicRegex.exec(paragraphText)) !== null) {
                        // Add text before formatting
                        if (match.index > lastEnd) {
                            formattedChildren.push(new TextRun({ text: paragraphText.substring(lastEnd, match.index) }));
                        }

                        const matchedText = match[0];
                        const cleanText = matchedText.replace(/^\*+|\*+$/g, '');

                        if (matchedText.startsWith('**')) {
                            formattedChildren.push(new TextRun({ text: cleanText, bold: true }));
                        } else if (matchedText.startsWith('*')) {
                            formattedChildren.push(new TextRun({ text: cleanText, italics: true }));
                        }

                        lastEnd = match.index + match[0].length;
                    }

                    // Add remaining text
                    if (lastEnd < paragraphText.length) {
                        formattedChildren.push(new TextRun({ text: paragraphText.substring(lastEnd) }));
                    }

                    children.push(new Paragraph({ children: formattedChildren }));
                } else if (paragraphText.trim() === '') {
                    children.push(new Paragraph({ text: '' })); // Empty line for spacing
                }
            }
        } else if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
            // Handle list start
            bulletStack.push(currentBulletLevel);
            currentBulletLevel = 0;
        } else if (token.type === 'list_item_open') {
            const nextToken = tokens[i + 1];
            if (nextToken && nextToken.type === 'paragraph_open') {
                const paraToken = tokens[i + 2];
                if (paraToken && paraToken.type === 'inline') {
                    children.push(new Paragraph({
                        text: paraToken.content,
                        bullet: { level: currentBulletLevel }
                    }));
                }
            }
            currentBulletLevel++;
        } else if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') {
            // Handle list end
            currentBulletLevel = bulletStack.pop() || 0;
        }
    }

    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: 'DefaultStyle',
                    name: 'Default Style',
                    basedOn: 'Normal',
                    next: 'Normal',
                    run: {
                        size: 24, // 12pt font size
                        font: 'Calibri',
                    },
                    paragraph: {
                        spacing: {
                            after: 200, // line spacing
                        },
                    },
                },
                {
                    id: 'Title',
                    name: 'Title',
                    basedOn: 'Normal',
                    run: {
                        size: 32, // 16pt for title
                        bold: true,
                        font: 'Calibri',
                    },
                    paragraph: {
                        spacing: {
                            before: 1000,
                            after: 1000,
                        },
                    },
                },
                {
                    id: 'Heading1',
                    name: 'Heading 1',
                    basedOn: 'Normal',
                    run: {
                        size: 28, // 14pt for H1
                        bold: true,
                        font: 'Calibri',
                    },
                    paragraph: {
                        spacing: {
                            before: 800,
                            after: 400,
                        },
                    },
                },
                {
                    id: 'Heading2',
                    name: 'Heading 2',
                    basedOn: 'Normal',
                    run: {
                        size: 26, // 13pt for H2
                        bold: true,
                        font: 'Calibri',
                    },
                    paragraph: {
                        spacing: {
                            before: 600,
                            after: 300,
                        },
                    },
                },
                {
                    id: 'Heading3',
                    name: 'Heading 3',
                    basedOn: 'Normal',
                    run: {
                        size: 24, // 12pt for H3
                        italics: true,
                        font: 'Calibri',
                    },
                    paragraph: {
                        spacing: {
                            before: 400,
                            after: 200,
                        },
                    },
                },
            ],
        },
        sections: [{ children }]
    });
    const blob = await Packer.toBlob(doc);
    const filename = `${projectName.replace(/\s+/g, '_')}_${reportTitle.replace(/\s+/g, '_')}.docx`;
    downloadBlob(blob, filename);
};
