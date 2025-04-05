// DOM Elements
const linkedinUrlForm = document.getElementById('linkedin-url-form');
const linkedinUrlInput = document.getElementById('linkedin-url');
const dataReviewForm = document.getElementById('linkedin-data-form');
const urlInputSection = document.getElementById('url-input-section');
const dataReviewSection = document.getElementById('data-review-section');
const templateSelectionSection = document.getElementById('template-selection-section');
const loadingContainer = document.getElementById('loading-container');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const retryButton = document.getElementById('retry-button');
const backToUrlButton = document.getElementById('back-to-url');
const backToReviewButton = document.getElementById('back-to-review');
const generateResumeButton = document.getElementById('generate-resume');
const addExperienceBtn = document.getElementById('add-experience');
const addEducationBtn = document.getElementById('add-education');
const experienceContainer = document.getElementById('experience-container');
const educationContainer = document.getElementById('education-container');
const templateCards = document.querySelectorAll('.template-card');

// Global variables
let linkedinData = null;
let selectedTemplate = 'modern';
let resumeData = {};

// Initialize docx library
let docx = window.docx;

// Step 1: Handle LinkedIn URL submission
linkedinUrlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = linkedinUrlInput.value.trim();
    if (!isValidLinkedInUrl(url)) {
        showError('Please enter a valid LinkedIn profile URL.');
        return;
    }
    
    // Show loading spinner
    urlInputSection.classList.add('hidden');
    loadingContainer.classList.remove('hidden');
    
    try {
        // In a real implementation, this would call your backend API
        // Here we're using a mock function that simulates fetching data
        const data = await fetchLinkedInData(url);
        linkedinData = data;
        
        // Populate the form with LinkedIn data
        populateReviewForm(data);
        
        // Hide loading, show review form
        loadingContainer.classList.add('hidden');
        dataReviewSection.classList.remove('hidden');
        
        // Update step indicators
        updateStepIndicators(2);
    } catch (error) {
        console.error('Error fetching LinkedIn data:', error);
        showError(error.message || 'Failed to fetch LinkedIn profile data');
    }
});

// Step 2: Handle data review form submission
dataReviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Collect form data
    resumeData = collectFormData();
    
    // Hide review form, show template selection
    dataReviewSection.classList.add('hidden');
    templateSelectionSection.classList.remove('hidden');
    
    // Update step indicators
    updateStepIndicators(3);
});

// Step 3: Handle template selection and resume generation
templateCards.forEach(card => {
    card.addEventListener('click', () => {
        templateCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTemplate = card.dataset.template;
    });
});

generateResumeButton.addEventListener('click', async () => {
    try {
        // Generate and download the resume
        await generateResume(resumeData, selectedTemplate);
    } catch (error) {
        console.error('Error generating resume:', error);
        showError('Failed to generate resume. Please try again.');
    }
});

// Navigation between steps
backToUrlButton.addEventListener('click', () => {
    dataReviewSection.classList.add('hidden');
    urlInputSection.classList.remove('hidden');
    updateStepIndicators(1);
});

backToReviewButton.addEventListener('click', () => {
    templateSelectionSection.classList.add('hidden');
    dataReviewSection.classList.remove('hidden');
    updateStepIndicators(2);
});

retryButton.addEventListener('click', () => {
    errorContainer.classList.add('hidden');
    urlInputSection.classList.remove('hidden');
    updateStepIndicators(1);
});

// Add experience entry
addExperienceBtn.addEventListener('click', () => {
    addExperienceEntry();
});

// Add education entry
addEducationBtn.addEventListener('click', () => {
    addEducationEntry();
});

// Remove entry
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-entry')) {
        e.target.closest('.experience-entry, .education-entry').remove();
    }
});

// Helper Functions

// Validate LinkedIn URL format
function isValidLinkedInUrl(url) {
    // Basic validation - in a real app, you might want more thorough validation
    return url.includes('linkedin.com/in/');
}

// Update step indicators
function updateStepIndicators(activeStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        if (index + 1 === activeStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    loadingContainer.classList.add('hidden');
    urlInputSection.classList.add('hidden');
    dataReviewSection.classList.add('hidden');
    templateSelectionSection.classList.add('hidden');
    errorContainer.classList.remove('hidden');
}

// Experience entry HTML template
function getExperienceEntryHTML(company = '', position = '', duration = '', description = '') {
    return `
        <div class="experience-entry">
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" class="company-name" value="${company}" required>
            </div>
            <div class="form-group">
                <label>Position</label>
                <input type="text" class="position" value="${position}" required>
            </div>
            <div class="form-group">
                <label>Duration</label>
                <input type="text" class="duration" value="${duration}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="description" rows="3" required>${description}</textarea>
            </div>
            <button type="button" class="remove-entry secondary-button">Remove</button>
        </div>
    `;
}

// Education entry HTML template
function getEducationEntryHTML(institution = '', degree = '', year = '') {
    return `
        <div class="education-entry">
            <div class="form-group">
                <label>Institution</label>
                <input type="text" class="institution" value="${institution}" required>
            </div>
            <div class="form-group">
                <label>Degree</label>
                <input type="text" class="degree" value="${degree}" required>
            </div>
            <div class="form-group">
                <label>Year</label>
                <input type="text" class="year" value="${year}" required>
            </div>
            <button type="button" class="remove-entry secondary-button">Remove</button>
        </div>
    `;
}

// Add empty experience entry
function addExperienceEntry() {
    experienceContainer.insertAdjacentHTML('beforeend', getExperienceEntryHTML());
}

// Add empty education entry
function addEducationEntry() {
    educationContainer.insertAdjacentHTML('beforeend', getEducationEntryHTML());
}

// Populate review form with LinkedIn data
function populateReviewForm(data) {
    // Personal info
    document.getElementById('fullName').value = data.fullName || '';
    document.getElementById('headline').value = data.headline || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('location').value = data.location || '';
    
    // Summary
    document.getElementById('summary').value = data.summary || '';
    
    // Experience
    experienceContainer.innerHTML = '';
    if (data.experience && data.experience.length > 0) {
        data.experience.forEach(exp => {
            experienceContainer.insertAdjacentHTML(
                'beforeend', 
                getExperienceEntryHTML(
                    exp.company || '',
                    exp.position || '',
                    exp.duration || '',
                    exp.description || ''
                )
            );
        });
    } else {
        addExperienceEntry();
    }
    
    // Education
    educationContainer.innerHTML = '';
    if (data.education && data.education.length > 0) {
        data.education.forEach(edu => {
            educationContainer.insertAdjacentHTML(
                'beforeend', 
                getEducationEntryHTML(
                    edu.institution || '',
                    edu.degree || '',
                    edu.year || ''
                )
            );
        });
    } else {
        addEducationEntry();
    }
    
    // Skills
    document.getElementById('skills').value = data.skills ? data.skills.join(', ') : '';
}

// Collect form data
function collectFormData() {
    const formData = {
        personalInfo: {
            fullName: document.getElementById('fullName').value,
            headline: document.getElementById('headline').value,
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

// Generate Word document for download
async function generateResume(data, templateType) {
    try {
        if (!docx) {
            docx = window.docx;
        }

        const { Document, Paragraph, TextRun, AlignmentType, BorderStyle } = docx;
        
        // Define template styles
        const templates = {
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
                }
            }
        };
        
        const template = templates[templateType] || templates.modern;
        
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
                            after: 200,
                        },
                        children: [
                            new TextRun({
                                text: data.personalInfo.headline,
                                italic: true,
                                size: template.fontSize.contact - 4,
                                font: template.fontFamily,
                                color: template.colors.secondary,
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
                            before: 400,
                            after: 200,
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
                            before: 400,
                            after: 200,
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
                    ...data.experience.flatMap(exp => [
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
                    ]),

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
                            before: 400,
                            after: 200,
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
                    ...data.education.flatMap(edu => [
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
                    ]),

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
                            before: 400,
                            after: 200,
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

        // Generate and download the resume
        const blob = await docx.Packer.toBlob(doc);
        const filename = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_resume.docx`;
        
        // Use FileSaver.js to save the file
        saveAs(blob, filename);
        
        return filename;
    } catch (error) {
        console.error('Error generating resume:', error);
        throw new Error('Failed to generate resume. Please try again.');
    }
}

// Mock LinkedIn API integration (since we can't directly access LinkedIn API from client-side)
// In a real application, this would be a call to your backend, which would use the LinkedIn API
async function fetchLinkedInData(url) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extract the username from the URL
    const urlParts = url.split('/');
    const username = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    
    // In a real app, this would be fetched from your backend
    // This is just mock data for demonstration
    return {
        fullName: "John Doe",
        headline: "Software Engineer & Web Developer",
        email: "john.doe@example.com",
        phone: "(123) 456-7890",
        location: "San Francisco, CA",
        summary: "Experienced software engineer with a passion for building innovative web applications. Specializing in frontend development with React and backend development with Node.js. Strong problem-solving skills and a track record of delivering high-quality code.",
        experience: [
            {
                company: "Tech Innovations Inc.",
                position: "Senior Software Engineer",
                duration: "Jan 2020 - Present",
                description: "Lead developer for the company's main product. Implemented new features, improved performance, and mentored junior developers."
            },
            {
                company: "WebSolutions Corp.",
                position: "Frontend Developer",
                duration: "Jun 2017 - Dec 2019",
                description: "Developed responsive web applications using React and Redux. Collaborated with designers to implement UI/UX improvements."
            }
        ],
        education: [
            {
                institution: "University of California, Berkeley",
                degree: "M.S. in Computer Science",
                year: "2015 - 2017"
            },
            {
                institution: "Stanford University",
                degree: "B.S. in Computer Science",
                year: "2011 - 2015"
            }
        ],
        skills: ["JavaScript", "React", "Node.js", "TypeScript", "HTML/CSS", "Git", "Docker", "AWS", "MongoDB", "SQL"]
    };
}

// Initialize - select first template by default
document.querySelector('.template-card').classList.add('selected');

// Mark first step as active
updateStepIndicators(1); 