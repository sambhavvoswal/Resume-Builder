const docx = require('docx');
const fs = require('fs');

const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Spacing, BorderStyle } = docx;

// Template styles configuration
const TEMPLATES = {
    professional: {
        fontFamily: "Arial",
        colors: {
            primary: "2E74B5",
            secondary: "000000"
        },
        fontSize: {
            name: 36,
            contact: 24,
            sectionHeader: 28,
            content: 24
        },
        spacing: {
            sectionBefore: 400,
            sectionAfter: 200,
            contentBefore: 100,
            contentAfter: 400
        },
        margins: {
            top: 1000,
            right: 1000,
            bottom: 1000,
            left: 1000
        }
    },
    modern: {
        fontFamily: "Calibri",
        colors: {
            primary: "1F4E78",
            secondary: "666666"
        },
        fontSize: {
            name: 40,
            contact: 22,
            sectionHeader: 30,
            content: 24
        },
        spacing: {
            sectionBefore: 500,
            sectionAfter: 200,
            contentBefore: 120,
            contentAfter: 400
        },
        margins: {
            top: 800,
            right: 1200,
            bottom: 800,
            left: 1200
        }
    },
    minimal: {
        fontFamily: "Helvetica",
        colors: {
            primary: "333333",
            secondary: "666666"
        },
        fontSize: {
            name: 32,
            contact: 20,
            sectionHeader: 26,
            content: 22
        },
        spacing: {
            sectionBefore: 300,
            sectionAfter: 150,
            contentBefore: 80,
            contentAfter: 300
        },
        margins: {
            top: 1200,
            right: 1000,
            bottom: 1200,
            left: 1000
        }
    }
};

function createHorizontalLine(style) {
    return new Paragraph({
        spacing: {
            before: 0,
            after: style.spacing.contentAfter,
        },
        borders: {
            bottom: {
                color: style.colors.primary,
                space: 1,
                style: BorderStyle.SINGLE,
                size: 20,
            },
        },
    });
}

function createSection(title, content, style, isHeader = false) {
    const sections = [];
    
    if (!isHeader) {
        sections.push(
            new Paragraph({
                spacing: {
                    before: style.spacing.sectionBefore,
                    after: style.spacing.sectionAfter,
                },
                children: [
                    new TextRun({
                        text: title.toUpperCase(),
                        bold: true,
                        size: style.fontSize.sectionHeader,
                        font: style.fontFamily,
                        color: style.colors.primary,
                    }),
                ],
            })
        );
    }

    sections.push(
        new Paragraph({
            alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: {
                before: isHeader ? 0 : style.spacing.contentBefore,
                after: style.spacing.contentAfter,
            },
            children: [
                new TextRun({
                    text: content,
                    size: isHeader ? style.fontSize.name : style.fontSize.content,
                    font: style.fontFamily,
                    bold: isHeader,
                    color: style.colors.secondary,
                }),
            ],
        })
    );

    // Add a horizontal line after each section (except for header sections)
    if (!isHeader) {
        sections.push(createHorizontalLine(style));
    }

    return sections;
}

function createResume(templateType, resumeData) {
    // Validate template type
    if (!TEMPLATES[templateType]) {
        throw new Error(`Invalid template type. Available templates: ${Object.keys(TEMPLATES).join(', ')}`);
    }

    // Validate required data
    const requiredFields = ['name', 'contact', 'profile', 'experience', 'education', 'skills'];
    const missingFields = requiredFields.filter(field => !resumeData[field]);
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const style = TEMPLATES[templateType];
    
    let doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: style.margins,
                },
            },
            children: [
                ...createSection('', resumeData.name, style, true),
                ...createSection('', resumeData.contact, style, true),
                ...createSection('Profile', resumeData.profile, style),
                ...createSection('Professional Experience', resumeData.experience, style),
                ...createSection('Education', resumeData.education, style),
                ...createSection('Skills', resumeData.skills, style),
            ],
        }],
    });

    return Packer.toBuffer(doc)
        .then((buffer) => {
            const filename = `${templateType}_resume.docx`;
            const outputPath = `./output/${filename}`;
            
            // Create output directory if it doesn't exist
            if (!fs.existsSync('./output')) {
                fs.mkdirSync('./output');
            }
            
            fs.writeFileSync(outputPath, buffer);
            console.log(`Resume created successfully: ${outputPath}`);
            return outputPath;
        })
        .catch((error) => {
            console.error('Error creating resume:', error);
            throw error;
        });
}

// Example usage
async function main() {
    try {
        const resumeData = {
            name: "John Doe",
            contact: "123 Main Street, NY | (123) 456-7890 | john@example.com",
            profile: "Experienced restaurant manager passionate about food and customer service.",
            experience: "Managed multiple restaurants, reduced costs, and increased customer engagement.",
            education: "B.S. in Business Administration, XYZ University.",
            skills: "Accounting, Budgeting, Team Leadership, POS Systems"
        };

        // Create resumes with different templates
        await createResume('professional', resumeData);
        await createResume('modern', resumeData);
        await createResume('minimal', resumeData);
        
    } catch (error) {
        console.error('Failed to create resume:', error);
    }
}

module.exports = { createResume, TEMPLATES }; 