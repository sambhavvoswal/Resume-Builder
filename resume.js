const docx = require('docx');
const fs = require('fs');

const { Document, Packer, Paragraph, TextRun } = docx;

function createResume(templateType, name, contact, profile, experience, education, skills) {
    let doc = new Document();

    doc.addSection({
        properties: {},
        children: [
            new Paragraph({
                children: [
                    new TextRun({ text: name, bold: true, size: 32 }),
                    new TextRun({ text: `\n${contact}`, break: 1, size: 24 }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Profile:", bold: true, size: 28 }),
                    new TextRun({ text: `\n${profile}`, break: 1, size: 24 }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Experience:", bold: true, size: 28 }),
                    new TextRun({ text: `\n${experience}`, break: 1, size: 24 }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Education:", bold: true, size: 28 }),
                    new TextRun({ text: `\n${education}`, break: 1, size: 24 }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Skills:", bold: true, size: 28 }),
                    new TextRun({ text: `\n${skills}`, break: 1, size: 24 }),
                ],
            }),
        ],
    });

    Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(`${templateType}_resume.docx`, buffer);
        console.log(`${templateType}_resume.docx created successfully!`);
    });
}

// Example usage:
createResume(
    "industry_manager",
    "John Doe",
    "123 Main Street, NY | (123) 456-7890 | john@example.com",
    "Experienced restaurant manager passionate about food and customer service.",
    "Managed multiple restaurants, reduced costs, and increased customer engagement.",
    "B.S. in Business Administration, XYZ University.",
    "Accounting, Budgeting, Team Leadership, POS Systems"
);
