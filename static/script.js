// Medical RAG Application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('antibioticForm');
    const queryInput = document.getElementById('clinicalQuery');
    const submitBtn = document.getElementById('submitBtn');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const resultsSection = document.getElementById('resultsSection');
    const recommendationContent = document.getElementById('recommendationContent');
    const errorMessage = document.getElementById('errorMessage');

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const query = queryInput.value.trim();
        
        // Validate input - don't allow submission if it's still the default text
        const defaultText = "e.g. What is the best antibiotic for a 45-year-old with community-acquired pneumonia in South Africa?";
        if (!query || query === defaultText) {
            showError('Please enter a clinical question or scenario to get a recommendation.');
            queryInput.classList.add('is-invalid');
            return;
        }
        
        // Clear previous states
        clearStates();
        queryInput.classList.remove('is-invalid');
        
        // Show loading state
        showLoading(true);
        
        try {
            // Make API request
            const response = await fetch('/get_recommendation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showRecommendation(data.answer);
            } else {
                showError(data.error);
            }
            
        } catch (error) {
            console.error('Error:', error);
            showError('Network error occurred. Please check your connection and try again.');
        } finally {
            showLoading(false);
        }
    });

    // Input validation on typing
    queryInput.addEventListener('input', function() {
        if (this.value.trim()) {
            this.classList.remove('is-invalid');
        }
    });

    // Clear previous states
    function clearStates() {
        loadingState.style.display = 'none';
        errorState.style.display = 'none';
        resultsSection.style.display = 'none';
    }

    // Show loading state
    function showLoading(show) {
        if (show) {
            loadingState.style.display = 'block';
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        } else {
            loadingState.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-search me-2"></i>Get Antibiotic Recommendation';
        }
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorState.style.display = 'block';
        
        // Scroll to error
        errorState.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Show recommendation
    function showRecommendation(answer) {
        // Format the answer for better display
        const formattedAnswer = formatRecommendation(answer);
        recommendationContent.innerHTML = formattedAnswer;
        resultsSection.style.display = 'block';
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Format recommendation for better display
    function formatRecommendation(answer) {
        // Split answer into main content and sources
        const parts = answer.split('\n\nRelevant Sources:\n');
        let mainContent = parts[0];
        const sources = parts[1] || '';

        // Remove ** formatting from the content
        mainContent = mainContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        let formatted = `<div class="mb-3"><strong>Recommendation:</strong></div>`;
        formatted += `<div class="mb-4">${mainContent.replace(/\n/g, '<br>')}</div>`;

        if (sources) {
            formatted += `<div class="border-top pt-3">`;
            formatted += `<div class="mb-2"><strong>Relevant Sources:</strong></div>`;
            
            // Format sources as a list
            const sourceLines = sources.split('\n').filter(line => line.trim());
            sourceLines.forEach(line => {
                if (line.trim().startsWith('- ')) {
                    const sourceText = line.substring(2); // Remove "- "
                    formatted += `<div class="source-item">${escapeHtml(sourceText)}</div>`;
                }
            });
            formatted += `</div>`;
        }

        return formatted;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Auto-resize textarea
    queryInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.max(this.scrollHeight, 150) + 'px';
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
        
        // Escape to clear form
        if (e.key === 'Escape') {
            queryInput.value = '';
            clearStates();
            queryInput.focus();
        }
    });

    // Set default text and focus on input when page loads
    const defaultText = "e.g. What is the best antibiotic for a 45-year-old with community-acquired pneumonia in South Africa?";
    if (!queryInput.value.trim()) {
        queryInput.value = defaultText;
        queryInput.style.color = '#6c757d'; // Gray color for placeholder-like text
    }
    queryInput.focus();
    
    // Handle focus - select all text and change color to normal when user focuses
    queryInput.addEventListener('focus', function() {
        if (this.value === defaultText) {
            this.select();
            this.style.color = '#333'; // Normal text color
        }
    });
    
    // Handle blur - restore placeholder style if empty
    queryInput.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.value = defaultText;
            this.style.color = '#6c757d'; // Gray color for placeholder-like text
        }
    });
    
    // Handle input - change color to normal when typing
    queryInput.addEventListener('input', function() {
        if (this.value !== defaultText) {
            this.style.color = '#333'; // Normal text color
        }
    });

    // Add loading animation to submit button on hover
    submitBtn.addEventListener('mouseenter', function() {
        if (!this.disabled) {
            this.style.transform = 'translateY(-2px)';
        }
    });

    submitBtn.addEventListener('mouseleave', function() {
        if (!this.disabled) {
            this.style.transform = 'translateY(0)';
        }
    });

    // Health check on page load
    fetch('/health')
        .then(response => response.json())
        .then(data => {
            console.log('Application health check:', data.status);
        })
        .catch(error => {
            console.warn('Health check failed:', error);
        });
});
