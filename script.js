document.addEventListener('DOMContentLoaded', () => {

    // --- URLs (IMPORTANT: Fill these with your actual links) ---
    const coursesURL = 'PASTE_YOUR_COURSES_CSV_LINK_HERE';
    const noticesURL = 'PASTE_YOUR_NOTICES_CSV_LINK_HERE';
    const blogURL = 'PASTE_YOUR_BLOG_CSV_LINK_HERE';
    const contactFormURL = 'PASTE_YOUR_WEB_APP_URL_HERE';

    // --- Helper function to fetch and parse CSV data ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            return lines.slice(1).map(line => {
                // This regex handles commas within quoted fields
                const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(v => v.trim().replace(/"/g, ''));
                let obj = {};
                headers.forEach((header, i) => { obj[header] = values[i] || ''; });
                return obj;
            });
        } catch (error) { console.error('Error fetching data:', error); return []; }
    }

    // --- Function to display dynamic content in new card format ---
    function displayContent(data, containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return; // Exit if the container isn't on the current page

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="loading-message">No items to display at this moment.</p>';
            return;
        }

        // Assign icons based on type
        let iconHtml;
        switch(type) {
            case 'course': iconHtml = '<i class="fas fa-book-reader"></i>'; break;
            case 'notice': iconHtml = '<i class="fas fa-bell"></i>'; break;
            case 'blog': iconHtml = '<i class="fas fa-newspaper"></i>'; break;
            default: iconHtml = '';
        }

        container.innerHTML = data.map((item, index) => {
            const meta = (type === 'course')
                ? `<div class="meta-item"><strong>Class:</strong> ${item.Class}</div><div class="meta-item"><strong>Subject:</strong> ${item.Subject}</div>`
                : `<div class="meta-item"><strong>Date:</strong> ${item.Date}</div>`;

            return `
                <div class="content-card scroll-animation" style="animation-delay: ${index * 100}ms;">
                    <div class="card-icon">${iconHtml}</div>
                    <div class="card-content">
                        <h3>${item.Title}</h3>
                        <div class="card-meta">${meta}</div>
                        ${item.Images ? `<img src="${item.Images}" alt="${item.Title}" class="card-image">` : ''}
                        <p class="card-description">${item.Description}</p>
                        <div class="card-links">
                            ${item.PDF ? `<a href="${item.PDF}" target="_blank" class="card-button pdf"><i class="fas fa-file-pdf"></i> View PDF</a>` : ''}
                            ${item.Videos ? `<a href="${item.Videos}" target="_blank" class="card-button video"><i class="fas fa-video"></i> Watch Video</a>` : ''}
                        </div>
                    </div>
                </div>`;
        }).join('');
        
        // After rendering, activate animations on the new elements
        activateScrollAnimations();
    }

    // --- Contact Form Submission Logic ---
    const form = document.getElementById('contact-form-element');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const status = document.getElementById('form-status');
            status.textContent = 'Sending...';
            status.style.color = '#333';
            fetch(contactFormURL, { method: 'POST', body: new FormData(form) })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        status.textContent = 'Message sent successfully!';
                        status.style.color = 'green';
                        form.reset();
                    } else { throw new Error(data.error); }
                })
                .catch(error => {
                    status.textContent = 'Oops! There was a problem. Please try again.';
                    status.style.color = 'red';
                    console.error('Form submission error:', error);
                });
        });
    }

    // --- Scroll Animation Logic ---
    function activateScrollAnimations() {
        const animatedElements = document.querySelectorAll('.scroll-animation');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // --- Page-specific Initialization ---
    async function initializePage() {
        if (document.getElementById('courses-list')) {
            const data = await fetchData(coursesURL);
            displayContent(data, 'courses-list', 'course');
        }
        if (document.getElementById('notices-list')) {
            const data = await fetchData(noticesURL);
            displayContent(data, 'notices-list', 'notice');
        }
        if (document.getElementById('blog-posts')) {
            const data = await fetchData(blogURL);
            displayContent(data, 'blog-posts', 'blog');
        }
        // Activate animations for static elements on any page
        activateScrollAnimations();
    }

    // --- Run the initialization ---
    initializePage();
});
