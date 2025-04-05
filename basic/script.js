// DOM Elements
const resumeForm = document.getElementById('resume-form');
const previewBtn = document.getElementById('preview-btn');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const editBtn = document.getElementById('edit-btn');
const previewSection = document.getElementById('preview-section');
const resumePreview = document.getElementById('resume-preview');
const addExperienceBtn = document.getElementById('add-experience');
const addEducationBtn = document.getElementById('add-education');
const experienceContainer = document.getElementById('experience-container');
const educationContainer = document.getElementById('education-container');

// Global variables
let resumeData = {};

// Initialize docx library
let docx = window.docx;

// Add experience entry
addExperienceBtn.addEventListener('click', () => {
    const experienceEntry = document.createElement('div');
    experienceEntry.className = 'experience-entry';
    experienceEntry.innerHTML = `
        <div class="form-group">
            <label for="company">Company</label>
            <input type="text" class="company-name" required>
        </div>
        <div class="form-group">
            <label for="position">Position</label>
            <input type="text" class="position" required>
        </div>
        <div class="form-group">
            <label for="duration">Duration</label>
            <input type="text" class="duration" required>
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <textarea class="description" rows="2" required></textarea>
        </div>
        <button type="button" class="remove-entry button secondary">Remove</button>
    `;
    experienceContainer.appendChild(experienceEntry);
});

// Add education entry
addEducationBtn.addEventListener('click', () => {
    const educationEntry = document.createElement('div');
    educationEntry.className = 'education-entry';
    educationEntry.innerHTML = `
        <div class="form-group">
            <label for="institution">Institution</label>
            <input type="text" class="institution" required>
        </div>
        <div class="form-group">
            <label for="degree">Degree</label>
            <input type="text" class="degree" required>
        </div>
        <div class="form-group">
            <label for="year">Year</label>
            <input type="text" class="year" required>
        </div>
        <button type="button" class="remove-entry button secondary">Remove</button>
    `;
    educationContainer.appendChild(educationEntry);
});

// Remove entry
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-entry')) {
        e.target.parentElement.remove();
    }
});

// Collect form data
function collectFormData() {
    const formData = {
        personalInfo: {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value
        },
        summary: document.getElementById('summary').value,
        experience: [],
        education: [],
        skills: document.getElementById('skills').value.split(',').map(skill => skill.trim()).filter(Boolean)
    };

    // Collect experience entries
    document.querySelectorAll('.experience-entry').forEach(entry => {
        formData.experience.push({
            company: entry.querySelector('.company-name').value,
            position: entry.querySelector('.position').value,
            duration: entry.querySelector('.duration').value,
            description: entry.querySelector('.description').value
        });
    });

    // Collect education entries
    document.querySelectorAll('.education-entry').forEach(entry => {
        formData.education.push({
            institution: entry.querySelector('.institution').value,
            degree: entry.querySelector('.degree').value,
            year: entry.querySelector('.year').value
        });
    });

    return formData;
}

// Generate resume preview
function generatePreview(data) {
    let html = `
        <div class="resume">
            <h1>${data.personalInfo.fullName}</h1>
            <div class="contact-info">
                <p>${data.personalInfo.email} | ${data.personalInfo.phone} | ${data.personalInfo.location}</p>
            </div>
            
            <h2>Professional Summary</h2>
            <p>${data.summary}</p>
            
            <h2>Work Experience</h2>
            ${data.experience.map(exp => `
                <div class="experience-item">
                    <h3>${exp.position}</h3>
                    <p class="company">${exp.company}</p>
                    <p class="duration">${exp.duration}</p>
                    <p class="description">${exp.description}</p>
                </div>
            `).join('')}
            
            <h2>Education</h2>
            ${data.education.map(edu => `
                <div class="education-item">
                    <h3>${edu.degree}</h3>
                    <p class="institution">${edu.institution}</p>
                    <p class="year">${edu.year}</p>
                </div>
            `).join('')}
            
            <h2>Skills</h2>
            <div class="skills-list">
                ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
    `;
    
    resumePreview.innerHTML = html;
}

// Preview button click handler
previewBtn.addEventListener('click', () => {
    const formData = collectFormData();
    resumeData = formData;
    generatePreview(formData);
    previewSection.classList.remove('hidden');
    document.querySelector('.form-container').classList.add('hidden');
});

// Edit button click handler
editBtn.addEventListener('click', () => {
    previewSection.classList.add('hidden');
    document.querySelector('.form-container').classList.remove('hidden');
});

// Generate Word document
async function generateWordDocument(data) {
    // Create a new document
    const { Document, Paragraph, TextRun, AlignmentType } = docx;
    
    const doc = new Document({
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
                // Name and Contact
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        after: 200,
                    },
                    children: [
                        new TextRun({
                            text: data.personalInfo.fullName,
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
                            text: `${data.personalInfo.email} | ${data.personalInfo.phone} | ${data.personalInfo.location}`,
                            size: 24,
                            font: "Arial",
                        }),
                    ],
                }),

                // Summary
                new Paragraph({
                    spacing: {
                        before: 400,
                        after: 200,
                    },
                    children: [
                        new TextRun({
                            text: "PROFESSIONAL SUMMARY",
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
                            text: data.summary,
                            size: 24,
                            font: "Arial",
                        }),
                    ],
                }),

                // Experience
                new Paragraph({
                    spacing: {
                        before: 400,
                        after: 200,
                    },
                    children: [
                        new TextRun({
                            text: "EXPERIENCE",
                            bold: true,
                            size: 28,
                            font: "Arial",
                            color: "2E74B5",
                        }),
                    ],
                }),
                ...data.experience.flatMap(exp => [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: exp.position,
                                bold: true,
                                size: 26,
                                font: "Arial",
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${exp.company} | ${exp.duration}`,
                                italic: true,
                                size: 24,
                                font: "Arial",
                            }),
                        ],
                    }),
                    new Paragraph({
                        spacing: {
                            after: 200,
                        },
                        children: [
                            new TextRun({
                                text: exp.description,
                                size: 24,
                                font: "Arial",
                            }),
                        ],
                    }),
                ]),

                // Education
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
                ...data.education.flatMap(edu => [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: edu.degree,
                                bold: true,
                                size: 26,
                                font: "Arial",
                            }),
                        ],
                    }),
                    new Paragraph({
                        spacing: {
                            after: 200,
                        },
                        children: [
                            new TextRun({
                                text: `${edu.institution} | ${edu.year}`,
                                italic: true,
                                size: 24,
                                font: "Arial",
                            }),
                        ],
                    }),
                ]),

                // Skills
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
                    children: [
                        new TextRun({
                            text: data.skills.join(" • "),
                            size: 24,
                            font: "Arial",
                        }),
                    ],
                }),
            ],
        }],
    });

    // Generate the document
    const blob = await docx.Packer.toBlob(doc);
    return blob;
}

// Generate button click handler
generateBtn.addEventListener('click', async () => {
    try {
        const formData = collectFormData();
        resumeData = formData;
        
        // Generate and preview the resume
        generatePreview(formData);
        previewSection.classList.remove('hidden');
        document.querySelector('.form-container').classList.add('hidden');
        
        // Generate Word document
        const docxBlob = await generateWordDocument(formData);
        
        // Save the document
        saveAs(docxBlob, `${formData.personalInfo.fullName.replace(/\s+/g, '_')}_resume.docx`);
    } catch (error) {
        console.error('Error generating document:', error);
        alert('Error generating document. Please try again.');
    }
});

// Download button click handler
downloadBtn.addEventListener('click', async () => {
    try {
        // Generate Word document
        const docxBlob = await generateWordDocument(resumeData);
        
        // Save the document
        saveAs(docxBlob, `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_resume.docx`);
    } catch (error) {
        console.error('Error downloading document:', error);
        alert('Error generating document. Please try again.');
    }
}); 