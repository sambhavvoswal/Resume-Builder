const docx = require('docx');
const fs = require('fs');

const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Spacing, BorderStyle } = docx;

function createResume(templateType, name, contact, profile, experience, education, skills) {
    let doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1000,
                        right: 1000,
                        bottom: 1000,
                        left: 1000,
                    },
                },
            },
            children: [
                // Name and Contact Section
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        after: 200,
                    },
                    children: [
                        new TextRun({
                            text: name,
                            bold: true,
                            size: 36,
                            font: "Arial",
                        }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        after: 400,
                    },
                    children: [
                        new TextRun({
                            text: contact,
                            size: 24,
                            font: "Arial",
                        }),
                    ],
                }),

                // Profile Section
                new Paragraph({
                    spacing: {
                        before: 400,
                        after: 200,
                    },
                    children: [
                        new TextRun({
                            text: "PROFILE",
                            bold: true,
                            size: 28,
                            font: "Arial",
                            color: "2E74B5",
                        }),
                    ],
                }),
                new Paragraph({
                    spacing: {
                        before: 100,
                        after: 400,
                    },
                    children: [
                        new TextRun({
                            text: profile,
                            size: 24,
                            font: "Arial",
                        }),
                    ],
                }),

                // Experience Section
                new Paragraph({
                    spacing: {
                        before: 400,
                        after: 200,
                    },
                    children: [
                        new TextRun({
                            text: "PROFESSIONAL EXPERIENCE",
                            bold: true,
                            size: 28,
                            font: "Arial",
                            color: "2E74B5",
                        }),
                    ],
                }),
                new Paragraph({
                    spacing: {
                        before: 100,
                        after: 400,
                    },
                    children: [
                        new TextRun({
                            text: experience,
                            size: 24,
                            font: "Arial",
                        }),
                    ],
                }),

                // Education Section
                new Paragraph({
                    spacing: {
                        before: 400,
                        after: 200,
                    },
                    children: [
                        new TextRun({
                            text: "EDUCATION",
                            bold: true,
                            size: 28,
                            font: "Arial",
                            color: "2E74B5",
                        }),
                    ],
                }),
                new Paragraph({
                    spacing: {
                        before: 100,
                        after: 400,
                    },
                    children: [
                        new TextRun({
                            text: education,
                            size: 24,
                            font: "Arial",
                        }),
                    ],
                }),

                // Skills Section
                new Paragraph({
                    spacing: {
                        before: 400,
                        after: 200,
                    },
                    children: [
                        new TextRun({
                            text: "SKILLS",
                            bold: true,
                            size: 28,
                            font: "Arial",
                            color: "2E74B5",
                        }),
                    ],
                }),
                new Paragraph({
                    spacing: {
                        before: 100,
                    },
                    children: [
                        new TextRun({
                            text: skills,
                            size: 24,
                            font: "Arial",
                        }),
                    ],
                }),
            ],
        }],
    });

    // Return a promise for better error handling
    return Packer.toBuffer(doc)
        .then((buffer) => {
            const filename = `${templateType}_resume.docx`;
            fs.writeFileSync(filename, buffer);
            console.log(`${filename} created successfully!`);
            return filename;
        })
        .catch((error) => {
            console.error('Error creating resume:', error);
            throw error;
        });
}

// Example usage with async/await
async function main() {
    try {
        await createResume(
            "professional",
            "John Doe",
            "123 Main Street, NY | (123) 456-7890 | john@example.com",
            "Experienced restaurant manager passionate about food and customer service.",
            "Managed multiple restaurants, reduced costs, and increased customer engagement.",
            "B.S. in Business Administration, XYZ University.",
            "Accounting, Budgeting, Team Leadership, POS Systems"
        );
    } catch (error) {
        console.error('Failed to create resume:', error);
    }
}

main();
