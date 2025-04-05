// Global variables
let selectedTemplate = 'modern';
let resumeData = {};
let docxLibrary = null;

// Theme switcher
const themeSwitcher = document.getElementById('theme-switcher');
const themeIcon = themeSwitcher.querySelector('i');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Theme switcher click handler
themeSwitcher.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Update theme icon
function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// DOM Elements
const templateCards = document.querySelectorAll('.template-card');
const resumeForm = document.getElementById('resume-form');
const previewBtn = document.getElementById('preview-btn');
const editBtn = document.getElementById('edit-btn');
const downloadDocxBtn = document.getElementById('download-docx');
const previewSection = document.getElementById('preview');
const builderSection = document.getElementById('builder');
const resumePreview = document.getElementById('resume-preview');
const addExperienceBtn = document.getElementById('add-experience');
const addEducationBtn = document.getElementById('add-education');
const experienceContainer = document.getElementById('experience-container');
const educationContainer = document.getElementById('education-container');
const getStartedBtn = document.querySelector('.cta-button');

// Smooth scroll functionality
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        const headerOffset = 70; // Height of the fixed header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Get Started button click handler
getStartedBtn.addEventListener('click', (e) => {
    e.preventDefault();
    smoothScroll('#templates');
});

// Initialize docx library
async function initializeDocx() {
    try {
        if (window.docx) {
            docxLibrary = window.docx;
            console.log('docx library loaded successfully');
        } else {
            throw new Error('docx library not found in window object');
        }
    } catch (error) {
        console.error('Error initializing docx library:', error);
        throw new Error('Failed to initialize docx library. Please refresh the page and try again.');
    }
}

// Wait for the docx library to load
function waitForDocx() {
    return new Promise((resolve, reject) => {
        if (docxLibrary) {
            resolve(docxLibrary);
            return;
        }

        if (window.docx) {
            docxLibrary = window.docx;
            resolve(docxLibrary);
            return;
        }

        const checkInterval = setInterval(() => {
            if (window.docx) {
                clearInterval(checkInterval);
                docxLibrary = window.docx;
                resolve(docxLibrary);
            }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('docx library failed to load. Please refresh the page and try again.'));
        }, 5000);
    });
}

// Initialize the application
async function initializeApp() {
    try {
        await initializeDocx();
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('Failed to initialize the application. Please refresh the page and try again.');
    }
}

// Start the application
initializeApp();

// Template selection
templateCards.forEach(card => {
    card.addEventListener('click', () => {
        templateCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTemplate = card.dataset.template;
    });
});

// Add experience entry
addExperienceBtn.addEventListener('click', () => {
    const experienceEntry = document.createElement('div');
    experienceEntry.className = 'experience-entry';
    experienceEntry.innerHTML = `
        <div class="form-group">
            <label>Company Name</label>
            <input type="text" class="company-name" required>
        </div>
        <div class="form-group">
            <label>Position</label>
            <input type="text" class="position" required>
        </div>
        <div class="form-group">
            <label>Duration</label>
            <input type="text" class="duration" required>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="description" rows="3" required></textarea>
        </div>
        <button type="button" class="remove-entry secondary-button">Remove</button>
    `;
    experienceContainer.appendChild(experienceEntry);
});

// Add education entry
addEducationBtn.addEventListener('click', () => {
    const educationEntry = document.createElement('div');
    educationEntry.className = 'education-entry';
    educationEntry.innerHTML = `
        <div class="form-group">
            <label>Institution</label>
            <input type="text" class="institution" required>
        </div>
        <div class="form-group">
            <label>Degree</label>
            <input type="text" class="degree" required>
        </div>
        <div class="form-group">
            <label>Year</label>
            <input type="text" class="year" required>
        </div>
        <button type="button" class="remove-entry secondary-button">Remove</button>
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
        skills: document.getElementById('skills').value.split(',').map(skill => skill.trim())
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
    const template = getTemplate(selectedTemplate);
    resumePreview.innerHTML = template(data);
}

// Get template HTML
function getTemplate(templateName) {
    const templates = {
        modern: (data) => `
            <div class="resume modern">
                <header>
                    <h1>${data.personalInfo.fullName}</h1>
                    <div class="contact-info">
                        <p>${data.personalInfo.email} | ${data.personalInfo.phone}</p>
                        <p>${data.personalInfo.location}</p>
                    </div>
                </header>
                
                <hr class="section-divider" />
                
                <section class="summary">
                    <h2>Professional Summary</h2>
                    <p>${data.summary}</p>
                </section>

                <hr class="section-divider" />

                <section class="experience">
                    <h2>Work Experience</h2>
                    ${data.experience.map(exp => `
                        <div class="experience-item">
                            <h3>${exp.position}</h3>
                            <p class="company">${exp.company}</p>
                            <p class="duration">${exp.duration}</p>
                            <p class="description">${exp.description}</p>
                        </div>
                    `).join('')}
                </section>

                <hr class="section-divider" />

                <section class="education">
                    <h2>Education</h2>
                    ${data.education.map(edu => `
                        <div class="education-item">
                            <h3>${edu.degree}</h3>
                            <p class="institution">${edu.institution}</p>
                            <p class="year">${edu.year}</p>
                        </div>
                    `).join('')}
                </section>

                <hr class="section-divider" />

                <section class="skills">
                    <h2>Skills</h2>
                    <div class="skills-list">
                        ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </section>
            </div>
        `,
        
        professional: (data) => `
            <div class="resume professional">
                <header>
                    <div class="header-content">
                        <h1>${data.personalInfo.fullName}</h1>
                        <div class="contact-info">
                            <p><i class="fas fa-envelope"></i> ${data.personalInfo.email}</p>
                            <p><i class="fas fa-phone"></i> ${data.personalInfo.phone}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${data.personalInfo.location}</p>
                        </div>
                    </div>
                </header>
                
                <hr class="section-divider" />
                
                <div class="content-wrapper">
                    <section class="summary">
                        <h2><i class="fas fa-user-circle"></i> Professional Summary</h2>
                        <p>${data.summary}</p>
                    </section>

                    <hr class="section-divider" />

                    <section class="experience">
                        <h2><i class="fas fa-briefcase"></i> Work Experience</h2>
                        ${data.experience.map(exp => `
                            <div class="experience-item">
                                <div class="experience-header">
                                    <h3>${exp.position}</h3>
                                    <span class="company">${exp.company}</span>
                                </div>
                                <span class="duration">${exp.duration}</span>
                                <p class="description">${exp.description}</p>
                            </div>
                        `).join('')}
                    </section>

                    <hr class="section-divider" />

                    <section class="education">
                        <h2><i class="fas fa-graduation-cap"></i> Education</h2>
                        ${data.education.map(edu => `
                            <div class="education-item">
                                <div class="education-header">
                                    <h3>${edu.degree}</h3>
                                    <span class="institution">${edu.institution}</span>
                                </div>
                                <span class="year">${edu.year}</span>
                            </div>
                        `).join('')}
                    </section>

                    <hr class="section-divider" />

                    <section class="skills">
                        <h2><i class="fas fa-tools"></i> Skills</h2>
                        <div class="skills-list">
                            ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </section>
                </div>
            </div>
        `,
        
        minimal: (data) => `
            <div class="resume minimal">
                <header>
                    <h1>${data.personalInfo.fullName}</h1>
                    <div class="contact-info">
                        <p>${data.personalInfo.email} • ${data.personalInfo.phone} • ${data.personalInfo.location}</p>
                    </div>
                </header>
                
                <hr class="section-divider" />
                
                <div class="content-grid">
                    <section class="summary">
                        <h2>About</h2>
                        <p>${data.summary}</p>
                    </section>

                    <hr class="section-divider" />

                    <section class="experience">
                        <h2>Experience</h2>
                        ${data.experience.map(exp => `
                            <div class="experience-item">
                                <div class="experience-header">
                                    <h3>${exp.position}</h3>
                                    <span class="duration">${exp.duration}</span>
                                </div>
                                <p class="company">${exp.company}</p>
                                <p class="description">${exp.description}</p>
                            </div>
                        `).join('')}
                    </section>

                    <hr class="section-divider" />

                    <section class="education">
                        <h2>Education</h2>
                        ${data.education.map(edu => `
                            <div class="education-item">
                                <div class="education-header">
                                    <h3>${edu.degree}</h3>
                                    <span class="year">${edu.year}</span>
                                </div>
                                <p class="institution">${edu.institution}</p>
                            </div>
                        `).join('')}
                    </section>

                    <hr class="section-divider" />

                    <section class="skills">
                        <h2>Skills</h2>
                        <div class="skills-list">
                            ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </section>
                </div>
            </div>
        `
    };
    
    return templates[templateName] || templates.modern; // Default to modern if template not found
}

// Preview button click handler
previewBtn.addEventListener('click', () => {
    const formData = collectFormData();
    resumeData = formData;
    generatePreview(formData);
    previewSection.classList.remove('hidden');
    builderSection.classList.add('hidden');
});

// Edit button click handler
editBtn.addEventListener('click', () => {
    previewSection.classList.add('hidden');
    builderSection.classList.remove('hidden');
});

// Form submit handler
resumeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = collectFormData();
    resumeData = formData;
    generatePreview(formData);
    previewSection.classList.remove('hidden');
    builderSection.classList.add('hidden');
});

// Download as Word document
downloadDocxBtn.addEventListener('click', async () => {
    try {
        // If resumeData is empty, try to collect it from the form
        if (!resumeData || !resumeData.personalInfo || !resumeData.personalInfo.fullName) {
            resumeData = collectFormData();
            if (!resumeData.personalInfo.fullName) {
                throw new Error('Please fill in your resume information first');
            }
        }

        // Ensure docx library is loaded
        if (!docxLibrary) {
            docxLibrary = await waitForDocx();
        }

        const formData = resumeData;
        const docx = await generateWordDocument(formData);
        
        // Create a blob from the document
        const blob = new Blob([docx], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.personalInfo.fullName.replace(/\s+/g, '_')}_resume.docx`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading document:', error);
        alert(error.message || 'Error generating Word document. Please try again.');
    }
});

// Add this after the TEMPLATES object in script.js
const WORD_TEMPLATES = {
    modern: {
        fontFamily: "Calibri",
        colors: {
            primary: "2E74B5",
            secondary: "404040"
        },
        fontSize: {
            name: 32,
            contact: 24,
            sectionHeader: 28,
            content: 24
        },
        spacing: {
            sectionBefore: 400,
            sectionAfter: 200
        }
    },
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
            sectionAfter: 200
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
            sectionAfter: 150
        }
    }
};

// Update the generateWordDocument function
async function generateWordDocument(data) {
    try {
        if (!docxLibrary) {
            docxLibrary = await waitForDocx();
        }

        const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docxLibrary;
        const template = WORD_TEMPLATES[selectedTemplate] || WORD_TEMPLATES.modern;

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
                    // Header with name and contact
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: {
                            after: 200,
                        },
                        children: [
                            new TextRun({
                                text: data.personalInfo.fullName,
                                bold: true,
                                size: template.fontSize.name,
                                font: template.fontFamily,
                                color: template.colors.primary,
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
                                size: template.fontSize.contact,
                                font: template.fontFamily,
                                color: template.colors.secondary,
                            }),
                        ],
                    }),

                    // Section separator
                    new Paragraph({
                        spacing: {
                            before: 200,
                            after: 200,
                        },
                        border: {
                            bottom: {
                                color: template.colors.primary,
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                            },
                        },
                    }),

                    // Professional Summary
                    new Paragraph({
                        spacing: {
                            before: template.spacing.sectionBefore,
                            after: template.spacing.sectionAfter,
                        },
                        children: [
                            new TextRun({
                                text: "PROFESSIONAL SUMMARY",
                                bold: true,
                                size: template.fontSize.sectionHeader,
                                font: template.fontFamily,
                                color: template.colors.primary,
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: data.summary,
                                size: template.fontSize.content,
                                font: template.fontFamily,
                            }),
                        ],
                    }),

                    // Section separator
                    new Paragraph({
                        spacing: {
                            before: 200,
                            after: 200,
                        },
                        border: {
                            bottom: {
                                color: template.colors.primary,
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                            },
                        },
                    }),

                    // Experience Section
                    new Paragraph({
                        spacing: {
                            before: template.spacing.sectionBefore,
                            after: template.spacing.sectionAfter,
                        },
                        children: [
                            new TextRun({
                                text: "EXPERIENCE",
                                bold: true,
                                size: template.fontSize.sectionHeader,
                                font: template.fontFamily,
                                color: template.colors.primary,
                            }),
                        ],
                    }),
                    ...data.experience.map(exp => [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: exp.position,
                                    bold: true,
                                    size: template.fontSize.content,
                                    font: template.fontFamily,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${exp.company} | ${exp.duration}`,
                                    size: template.fontSize.content,
                                    font: template.fontFamily,
                                    color: template.colors.secondary,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: exp.description,
                                    size: template.fontSize.content,
                                    font: template.fontFamily,
                                }),
                            ],
                            spacing: {
                                after: 200,
                            },
                        }),
                    ]).flat(),

                    // Section separator
                    new Paragraph({
                        spacing: {
                            before: 200,
                            after: 200,
                        },
                        border: {
                            bottom: {
                                color: template.colors.primary,
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                            },
                        },
                    }),

                    // Education Section
                    new Paragraph({
                        spacing: {
                            before: template.spacing.sectionBefore,
                            after: template.spacing.sectionAfter,
                        },
                        children: [
                            new TextRun({
                                text: "EDUCATION",
                                bold: true,
                                size: template.fontSize.sectionHeader,
                                font: template.fontFamily,
                                color: template.colors.primary,
                            }),
                        ],
                    }),
                    ...data.education.map(edu => [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: edu.degree,
                                    bold: true,
                                    size: template.fontSize.content,
                                    font: template.fontFamily,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${edu.institution} | ${edu.year}`,
                                    size: template.fontSize.content,
                                    font: template.fontFamily,
                                    color: template.colors.secondary,
                                }),
                            ],
                            spacing: {
                                after: 200,
                            },
                        }),
                    ]).flat(),

                    // Section separator
                    new Paragraph({
                        spacing: {
                            before: 200,
                            after: 200,
                        },
                        border: {
                            bottom: {
                                color: template.colors.primary,
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                            },
                        },
                    }),

                    // Skills Section
                    new Paragraph({
                        spacing: {
                            before: template.spacing.sectionBefore,
                            after: template.spacing.sectionAfter,
                        },
                        children: [
                            new TextRun({
                                text: "SKILLS",
                                bold: true,
                                size: template.fontSize.sectionHeader,
                                font: template.fontFamily,
                                color: template.colors.primary,
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: data.skills.join(" • "),
                                size: template.fontSize.content,
                                font: template.fontFamily,
                            }),
                        ],
                    }),
                ],
            }],
        });

        return docxLibrary.Packer.toBlob(doc);
    } catch (error) {
        console.error('Error in generateWordDocument:', error);
        throw new Error('Failed to generate Word document: ' + error.message);
    }
} 