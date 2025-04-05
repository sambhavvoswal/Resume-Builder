// Template skill sets - defines which skills align with each template
const templateSkillSets = {
    modern: [
        "software development", "programming", "web development", "react", "javascript", 
        "ui/ux", "design", "product management", "tech", "digital marketing",
        "social media", "content creation", "data science", "machine learning"
    ],
    professional: [
        "finance", "accounting", "banking", "business", "consulting", 
        "management", "project management", "human resources", "administration",
        "legal", "healthcare", "sales", "marketing", "analysis"
    ],
    minimal: [
        "creative", "art", "design", "photography", "writing", "editing",
        "architecture", "fashion", "music", "film", "theater", "education",
        "teaching", "research", "academia"
    ]
};

// Calculate template match score based on user skills
function calculateTemplateMatch(userSkills) {
    // Normalize user skills (lowercase, trim)
    const normalizedSkills = userSkills.map(skill => skill.toLowerCase().trim());
    
    const matchScores = {};
    
    // Calculate match score for each template
    for (const [template, templateSkills] of Object.entries(templateSkillSets)) {
        let matchCount = 0;
        let matchedSkills = [];
        
        // Count matching skills
        for (const userSkill of normalizedSkills) {
            for (const templateSkill of templateSkills) {
                // Check if user skill contains template skill or vice versa
                if (userSkill.includes(templateSkill) || templateSkill.includes(userSkill)) {
                    matchCount++;
                    matchedSkills.push(userSkill);
                    break;
                }
            }
        }
        
        // Calculate percentage match
        const matchPercentage = normalizedSkills.length > 0 
            ? Math.round((matchCount / normalizedSkills.length) * 100)
            : 0;
            
        matchScores[template] = {
            score: matchPercentage,
            matchedSkills: [...new Set(matchedSkills)], // Remove duplicates
        };
    }
    
    return matchScores;
}

// Get top template recommendations
function getRecommendations(userSkills, count = 2) {
    if (!userSkills || userSkills.length === 0) {
        return [];
    }
    
    const matchScores = calculateTemplateMatch(userSkills);
    
    // Sort templates by match score (descending)
    const sortedTemplates = Object.entries(matchScores)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, count)
        .map(([template, data]) => ({
            template,
            score: data.score,
            matchedSkills: data.matchedSkills
        }));
        
    return sortedTemplates;
}

// Create and show recommendation popup
function showRecommendationPopup(userSkills) {
    // Get recommendations
    const recommendations = getRecommendations(userSkills);
    
    if (recommendations.length === 0) {
        return;
    }
    
    // Remove existing popup if any
    const existingPopup = document.getElementById('recommendation-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'recommendation-popup';
    popup.className = 'recommendation-popup';
    
    // Create popup content
    let popupContent = `
        <div class="recommendation-header">
            <h3>Recommended Templates</h3>
            <button class="close-recommendation" aria-label="Close">×</button>
        </div>
        <div class="recommendation-content">
            <p>Based on your skills, we recommend:</p>
            <ul class="recommendation-list">
    `;
    
    // Add recommendations to popup content
    recommendations.forEach(rec => {
        popupContent += `
            <li class="recommendation-item">
                <div class="recommendation-template">
                    <strong>${capitalizeFirstLetter(rec.template)}</strong>
                    <span class="match-score">${rec.score}% match</span>
                </div>
                <p class="matching-skills">Matching skills: ${rec.matchedSkills.join(', ')}</p>
                <button class="apply-template" data-template="${rec.template}">Use This Template</button>
            </li>
        `;
    });
    
    popupContent += `
            </ul>
        </div>
    `;
    
    popup.innerHTML = popupContent;
    
    // Append popup to body
    document.body.appendChild(popup);
    
    // Add event listeners
    popup.querySelector('.close-recommendation').addEventListener('click', () => {
        popup.remove();
    });
    
    popup.querySelectorAll('.apply-template').forEach(button => {
        button.addEventListener('click', (e) => {
            const templateName = e.target.getAttribute('data-template');
            applyRecommendedTemplate(templateName);
            popup.remove();
        });
    });
    
    // Position popup next to the preview section
    positionPopup(popup);
}

// Position popup next to preview section
function positionPopup(popup) {
    // Make the popup fixed position
    popup.style.position = 'fixed';
    
    // Position in the bottom right corner of the screen
    popup.style.bottom = '30px';
    popup.style.right = '30px';
    
    // Remove any existing left/top positioning
    popup.style.left = '';
    popup.style.top = '';
}

// Apply the recommended template
function applyRecommendedTemplate(templateName) {
    // Find the template radio button and click it
    const templateRadio = document.querySelector(`input[name="resume-style"][value="${templateName}"]`);
    if (templateRadio) {
        templateRadio.checked = true;
        
        // Trigger change event to update the preview
        const event = new Event('change');
        templateRadio.dispatchEvent(event);
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Trigger recommendation when skills are entered
function setupSkillsRecommendation() {
    const skillsInput = document.getElementById('skills');
    
    if (skillsInput) {
        let debounceTimer;
        
        skillsInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            
            debounceTimer = setTimeout(() => {
                const skillsText = skillsInput.value;
                if (skillsText.trim()) {
                    const skills = skillsText.split(',').map(skill => skill.trim()).filter(Boolean);
                    if (skills.length > 0) {
                        showRecommendationPopup(skills);
                    }
                }
            }, 1000); // Debounce for 1 second
        });
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', setupSkillsRecommendation); 